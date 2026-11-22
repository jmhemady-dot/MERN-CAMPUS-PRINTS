const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

const User = require("../models/User");

async function main() {
  let input = "";

  for await (const chunk of process.stdin) {
    input += chunk.toString();
  }

  let details;
  try {
    details = JSON.parse(input);
  } catch {
    throw new Error("Expected JSON input.");
  }

  const email = String(details.email || "").trim().toLowerCase();
  const password = details.password;

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof password !== "string" ||
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error("Invalid email or password. Password must be 12-72 bytes.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB connection is not configured.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await User.updateOne(
    { email, role: "admin" },
    { $set: { password: hashedPassword } },
    { runValidators: true }
  );

  if (result.matchedCount === 0) {
    throw new Error("No admin account found for that email.");
  }

  console.log("Admin password reset successfully.");
}

main()
  .catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
