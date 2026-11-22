const express = require("express");
const rateLimit = require("express-rate-limit");
const authenticate = require("../middleware/authenticate");
const { publicUser } = require("../utils/authSession");
const { register, login, logout } = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post("/logout", logout);

module.exports = router;
