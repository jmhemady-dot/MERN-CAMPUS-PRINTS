const jwt = require("jsonwebtoken");

function publicUser(user) {
  return {
    id: user._id,
    fullname: user.fullname,
    student_id: user.student_id,
    email: user.email,
    role: user.role
  };
}

function setSession(res, user) {
  const token = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("campus_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400000
  });
}

module.exports = { publicUser, setSession };
