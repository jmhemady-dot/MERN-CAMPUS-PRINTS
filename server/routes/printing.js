const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { isAllowedOrigin } = require("../config/clientOrigins");
const User = require("../models/User");
const PrintRequest = require("../models/PrintRequest");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const folder = path.resolve(__dirname, "../private-uploads");

const allowed = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword", "application/octet-stream"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"]
};

function validSignature(file, ext) {
  const b = file.buffer;
  if (ext === ".pdf") return b.subarray(0, 5).toString() === "%PDF-";
  if (ext === ".jpg" || ext === ".jpeg")
    return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (ext === ".png")
    return b.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  if (ext === ".docx")
    return b.subarray(0, 4).equals(Buffer.from("504b0304", "hex"));
  if (ext === ".doc")
    return b.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex"));
  return false;
}

async function auth(req, res, next) {
  try {
    const token = req.cookies?.campus_token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.isValidObjectId(payload.id)) throw Error("Invalid user");
    const user = await User.findById(payload.id);
    if (!user || !["student", "faculty"].includes(user.role))
      return res.status(403).json({ error: "Access denied" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Please log in" });
  }
}

function sameOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!isAllowedOrigin(origin))
    return res.status(403).json({ error: "Invalid request origin" });
  next();
}

router.post("/", auth, sameOrigin, (req, res, next) => {
  upload.single("document")(req, res, err => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  let savedPath;
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Select a document" });

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed[ext] ||
        !allowed[ext].includes(file.mimetype) ||
        !validSignature(file, ext)) {
      return res.status(400).json({ error: "Unsupported or invalid document" });
    }

    const copies = Number(req.body.copies);
    const pages = Number(req.body.pages);
    const paper_size = req.body.paper_size;
    const color_mode = req.body.color_mode;
    const print_type = req.body.print_type;
    const orientation = req.body.orientation;

    if (!Number.isInteger(copies) || copies < 1 || copies > 100 ||
        !Number.isInteger(pages) || pages < 1 || pages > 1000 ||
        !["A4", "Letter", "Legal"].includes(paper_size) ||
        !["Black and White", "Colored"].includes(color_mode) ||
        !["Single-sided", "Double-sided"].includes(print_type) ||
        !["Portrait", "Landscape"].includes(orientation)) {
      return res.status(400).json({ error: "Invalid printing options" });
    }

    const estimated_cost = copies * pages * (color_mode === "Colored" ? 5 : 1);

    const counter = await mongoose.connection.collection("counters")
      .findOneAndUpdate(
        { _id: "printQueue" },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" }
      );

    const queue_number = counter.value;

    await fs.mkdir(folder, { recursive: true });
    const storedName = crypto.randomUUID() + ext;
    savedPath = path.join(folder, storedName);
    await fs.writeFile(savedPath, file.buffer, { flag: "wx" });

    const request = await PrintRequest.create({
      user_id: req.user._id,
      filename: path.basename(file.originalname),
      file_path: storedName,
      copies,
      pages,
      paper_size,
      color_mode,
      print_type,
      orientation,
      estimated_cost,
      queue_number,
      status: "Pending"
    });

    return res.status(201).json({
      message: "Print request submitted",
      id: request._id,
      queue_number,
      estimated_cost
    });
  } catch (err) {
    if (savedPath) await fs.unlink(savedPath).catch(() => {});
    console.error("Print submission error:", err.message);
    res.status(500).json({ error: "Could not submit request" });
  }
});

module.exports = router;
