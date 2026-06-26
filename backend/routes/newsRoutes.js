const express = require("express");
const newsController = require("../controller/newsController");

module.exports = (upload) => {
  const router = express.Router();

  router.get("/", newsController.getNews);
  router.post("/", upload.single("image"), newsController.createNews);
  router.put("/:id", upload.single("image"), newsController.updateNews);
  router.delete("/:id", newsController.deleteNews);

  return router;
};
