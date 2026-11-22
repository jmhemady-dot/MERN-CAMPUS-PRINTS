const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs/promises");

const { isAllowedOrigin } = require("../config/clientOrigins");
const User = require("../models/User");
const PrintRequest = require("../models/PrintRequest");

const router = express.Router();

const statuses = [
  "Pending", "In Progress", "Printing",
  "Ready for Pickup", "Completed"
];

router.use(async (req, res, next) => {
  try {
    const token = req.cookies?.campus_token;
    if (!token) return res.status(401).json({ error: "Please log in" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!mongoose.isValidObjectId(payload.id))
      return res.status(401).json({ error: "Invalid session" });

    const user = await User.findById(payload.id);

    if (!user) return res.status(401).json({ error: "Invalid session" });
    if (user.role !== "admin")
      return res.status(403).json({ error: "Administrators only" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
});

function checkOrigin(req, res, next) {
  if (!isAllowedOrigin(req.get("Origin")))
    return res.status(403).json({ error: "Invalid request origin" });
  next();
}

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim().slice(0, 100);
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pipeline = [
      {
        $lookup: {
          from: User.collection.name,
          localField: "user_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" }
    ];

    if (search) {
      pipeline.push({
        $addFields: {
          queue_number_text: { $toString: "$queue_number" }
        }
      });
      pipeline.push({
        $match: {
          $or: [
            { filename: { $regex: escaped, $options: "i" } },
            { "student.fullname": { $regex: escaped, $options: "i" } },
            { queue_number_text: { $regex: escaped, $options: "i" } }
          ]
        }
      });
    }

    pipeline.push(
      { $sort: { queue_number: 1 } },
      {
        $project: {
          filename: 1,
          pages: 1,
          copies: 1,
          estimated_cost: 1,
          status: 1,
          queue_number: 1,
          createdAt: 1,
          fullname: "$student.fullname",
          student_id: "$student.student_id"
        }
      }
    );

    const requests = await PrintRequest.aggregate(pipeline);
    res.json({ requests });
  } catch (err) {
    console.error("Admin list error:", err.message);
    res.status(500).json({ error: "Unable to load requests" });
  }
});

router.patch("/:id/status", checkOrigin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id) || !statuses.includes(status))
      return res.status(400).json({ error: "Invalid request or status" });

    const updated = await PrintRequest.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Request not found" });

    res.json({ message: "Status updated", status: updated.status });
  } catch (err) {
    console.error("Admin update error:", err.message);
    res.status(500).json({ error: "Unable to update status" });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: "Invalid request" });

    const request = await PrintRequest.findById(req.params.id).lean();
    if (!request)
      return res.status(404).json({ error: "Request not found" });

    const stored = request.file_path;
    if (typeof stored !== "string" ||
        !/^[a-f0-9-]{36}\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(stored)) {
      return res.status(404).json({ error: "File unavailable" });
    }

    const directory = path.resolve(__dirname, "../private-uploads");
    const file = path.resolve(directory, stored);
    if (path.dirname(file) !== directory)
      return res.status(403).json({ error: "Invalid file path" });

    await fs.access(file);

    const ext = path.extname(stored).toLowerCase();
    const mimes = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png"
    };

    const original = path.basename(
      String(request.filename || "document").replace(/\\/g, "/")
    ).replace(/[\r\n"]/g, "_");

    res.setHeader("Content-Type", mimes[ext]);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Disposition",
      "attachment; filename=\"document" + ext + "\"; filename*=UTF-8''" +
      encodeURIComponent(original));

    res.sendFile(file);
  } catch (err) {
    if (err.code === "ENOENT")
      return res.status(404).json({ error: "File unavailable" });

    console.error("Download error:", err.message);
    if (!res.headersSent)
      res.status(500).json({ error: "Download failed" });
  }
});

module.exports = router;
