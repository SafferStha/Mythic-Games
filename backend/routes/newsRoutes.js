const express = require("express");
const newsController = require("../controller/newsController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

module.exports = (upload) => {
  const router = express.Router();

  router.get("/", newsController.getNews);
  router.post("/", authenticateToken, requireAdmin, upload.single("image"), newsController.createNews);
  router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), newsController.updateNews);
  router.delete("/:id", authenticateToken, requireAdmin, newsController.deleteNews);

  return router;
};
