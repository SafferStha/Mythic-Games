const newsModel = require("../model/newsModel");

function formatRelativeTime(value) {
  const createdAt = new Date(value);
  const diffMs = Date.now() - createdAt.getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return "JUST NOW";
  }

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "JUST NOW";
  if (minutes < 60) return `${minutes}M AGO`;
  if (hours < 24) return `${hours}H AGO`;
  if (days < 7) return `${days}D AGO`;
  if (weeks < 5) return `${weeks}W AGO`;
  if (months < 12) return `${months}MO AGO`;
  return `${years}Y AGO`;
}

function toNewsResponse(news) {
  return {
    id: news.id,
    dateLabel: formatRelativeTime(news.created_at),
    title: news.title,
    excerpt: news.excerpt,
    image: news.image_url,
    createdAt: news.created_at,
    updatedAt: news.updated_at,
  };
}

function normalizeNewsPayload(body, file) {
  const title = String(body.title || "").trim();

  if (!title) {
    return null;
  }

  return {
    dateLabel: "",
    title,
    excerpt: String(body.excerpt || "").trim(),
    imageUrl: file
      ? `/uploads/${file.filename}`
      : body.image !== undefined || body.image_url !== undefined
        ? String(body.image || body.image_url || "").trim()
        : undefined,
  };
}

async function getNews(req, res) {
  try {
    const news = await newsModel.getAllNews();
    res.json({
      success: true,
      data: news.map(toNewsResponse),
    });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch news.",
    });
  }
}

async function createNews(req, res) {
  const payload = normalizeNewsPayload(req.body, req.file);

  if (!payload) {
    return res.status(400).json({
      success: false,
      message: "Title is required.",
    });
  }

  try {
    const created = await newsModel.createNews(payload);
    res.status(201).json({
      success: true,
      data: toNewsResponse(created),
    });
  } catch (error) {
    console.error("Create news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create news.",
    });
  }
}

async function updateNews(req, res) {
  const payload = normalizeNewsPayload(req.body, req.file);

  if (!payload) {
    return res.status(400).json({
      success: false,
      message: "Title is required.",
    });
  }

  try {
    const updated = await newsModel.updateNews(req.params.id, payload);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "News item not found.",
      });
    }

    res.json({
      success: true,
      data: toNewsResponse(updated),
    });
  } catch (error) {
    console.error("Update news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update news.",
    });
  }
}

async function deleteNews(req, res) {
  try {
    const deleted = await newsModel.deleteNews(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "News item not found.",
      });
    }

    res.json({
      success: true,
      message: "News deleted successfully.",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete news.",
    });
  }
}

module.exports = {
  getNews,
  createNews,
  updateNews,
  deleteNews,
};
