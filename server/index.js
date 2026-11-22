require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { isAllowedOrigin } = require("./config/clientOrigins");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json());
app.use(require("cookie-parser")());
app.use("/api/admin/dashboard", require("./routes/adminDashboard"));

app.use("/api/admin/requests", require("./routes/adminRequests"));
app.use("/api/student", require("./routes/studentRequests"));
app.use("/api/printing", require("./routes/printing"));

app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/auth", require("./routes/auth"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Campus Prints API is running",
    database: "connected"
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Campus Prints API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();










