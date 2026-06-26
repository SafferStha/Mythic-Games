const express = require("express");
const db = require("../db");

function toBoolean(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toTextArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    // Fall back to comma-separated text from simple form fields.
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasField(body, ...names) {
  return names.some((name) => body[name] !== undefined);
}

function firstField(body, ...names) {
  const fieldName = names.find((name) => body[name] !== undefined);
  return fieldName ? body[fieldName] : undefined;
}

function buildGamePayload(body, file, useDefaults = false) {
  const game = {};

  if (hasField(body, "title") || useDefaults) {
    game.title = body.title;
  }

  if (hasField(body, "game_type", "type") || useDefaults) {
    game.game_type = firstField(body, "game_type", "type") || "Base Game";
  }

  if (hasField(body, "price") || useDefaults) {
    game.price = toNumber(body.price);
  }

  if (hasField(body, "original_price", "originalPrice") || useDefaults) {
    game.original_price = toNumber(
      firstField(body, "original_price", "originalPrice"),
    );
  }

  if (hasField(body, "discount_percent", "discountPercent") || useDefaults) {
    game.discount_percent = toNumber(
      firstField(body, "discount_percent", "discountPercent"),
    );
  }

  if (file || hasField(body, "image_url", "image")) {
    game.image_url = file
      ? `/uploads/${file.filename}`
      : firstField(body, "image_url", "image");
  }

  if (hasField(body, "description") || useDefaults) {
    game.description = body.description || "";
  }

  if (hasField(body, "genres") || useDefaults) {
    game.genres = toTextArray(body.genres);
  }

  if (hasField(body, "events") || useDefaults) {
    game.events = toTextArray(body.events);
  }

  if (hasField(body, "is_upcoming", "isUpcoming") || useDefaults) {
    game.is_upcoming = toBoolean(firstField(body, "is_upcoming", "isUpcoming"));
  }

  if (hasField(body, "is_trending", "isTrending") || useDefaults) {
    game.is_trending = toBoolean(firstField(body, "is_trending", "isTrending"));
  }

  if (hasField(body, "is_new_release", "isNewRelease") || useDefaults) {
    game.is_new_release = toBoolean(
      firstField(body, "is_new_release", "isNewRelease"),
    );
  }

  if (hasField(body, "is_free", "isFree") || useDefaults) {
    game.is_free = toBoolean(firstField(body, "is_free", "isFree"));
  }

  return game;
}

module.exports = (upload) => {
  const router = express.Router();

  // Get all games (with optional filtering)
  router.get("/", async (req, res) => {
    try {
      const { is_upcoming, is_trending, is_new_release, is_free } = req.query;
      let query = "SELECT * FROM games";
      const conditions = [];
      const values = [];

      if (is_upcoming)
        conditions.push(`is_upcoming = $${values.push(is_upcoming)}`);
      if (is_trending)
        conditions.push(`is_trending = $${values.push(is_trending)}`);
      if (is_new_release)
        conditions.push(`is_new_release = $${values.push(is_new_release)}`);
      if (is_free) conditions.push(`is_free = $${values.push(is_free)}`);

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += " ORDER BY created_at DESC";

      const result = await db.query(query, values);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create a new game
  router.post("/", upload.single("image"), async (req, res) => {
    const game = buildGamePayload(req.body, req.file, true);

    const query = `
      INSERT INTO games (
        title, game_type, price, original_price, discount_percent,
        image_url, description, genres, events,
        is_upcoming, is_trending, is_new_release, is_free
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`;

    const values = [
      game.title,
      game.game_type,
      game.price,
      game.original_price,
      game.discount_percent,
      game.image_url,
      game.description,
      game.genres,
      game.events,
      game.is_upcoming,
      game.is_trending,
      game.is_new_release,
      game.is_free,
    ];

    try {
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update a game
  router.put("/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const game = buildGamePayload(req.body, req.file);

    const keys = Object.keys(game).filter((key) => game[key] !== undefined);
    const values = keys.map((key) => game[key]);
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    if (!keys.length) {
      return res.status(400).json({ error: "No game fields provided." });
    }

    try {
      const query = `UPDATE games SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 1} RETURNING *`;
      const result = await db.query(query, [...values, id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Game not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a game
  router.delete("/:id", async (req, res) => {
    try {
      const result = await db.query("DELETE FROM games WHERE id = $1", [
        req.params.id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Game not found" });
      }

      res.json({ message: "Game deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
