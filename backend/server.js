const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const gameRoutes = require("./routes/gameRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const newsRoutes = require("./routes/newsRoutes");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/games", gameRoutes(upload));
app.use("/api/users", userRoutes(upload));
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/news", newsRoutes(upload));

// Root
app.get("/", (req, res) => {
  res.json({ message: "Mythic Games API is running" });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ Export app for testing
module.exports = app;

// ✅ Start server ONLY if not in test
if (process.env.NODE_ENV !== "test") {
  (async () => {
    try {
      await db.ensureDatabaseSchema();

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });

    } catch (error) {
      console.error("DB init error:", error);
      process.exit(1);
    }
  })();
}