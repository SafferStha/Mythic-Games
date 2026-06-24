const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const gameRoutes = require("./routes/gameRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing req.body
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes(upload));
app.use("/api/auth", userRoutes(upload)); // Ensure frontend auth calls work
app.use("/api/payments", paymentRoutes);

// Standardize root response to JSON
app.get("/", (req, res) =>
  res.json({ message: "Mythic Games API is running" }),
);

// Catch-all 404 handler for any request that doesn't match existing routes
app.use((req, res) => {
  res
    .status(404)
    .json({
      error: `Route ${req.originalUrl} not found. Ensure your frontend is hitting the correct /api/... endpoint.`,
    });
});

// Global Error Handler to catch any server-side crashes and return JSON
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

async function startServer() {
  try {
    await db.ensureDatabaseSchema();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        console.error(
          `Error: Port ${PORT} is already in use. Please kill the process or use a different port.`,
        );
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    process.exit(1);
  }
}

startServer();
