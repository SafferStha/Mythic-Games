const db = require("../database/db");

async function getAllNews() {
  const result = await db.query(
    `SELECT id, date_label, title, excerpt, image_url, created_at, updated_at
     FROM news
     ORDER BY created_at DESC`,
  );

  return result.rows;
}

async function createNews({ dateLabel, title, excerpt, imageUrl }) {
  const result = await db.query(
    `INSERT INTO news (date_label, title, excerpt, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, date_label, title, excerpt, image_url, created_at, updated_at`,
    [dateLabel, title, excerpt, imageUrl],
  );

  return result.rows[0];
}

async function updateNews(id, { dateLabel, title, excerpt, imageUrl }) {
  const result = await db.query(
    `UPDATE news
     SET date_label = $2,
         title = $3,
         excerpt = $4,
         image_url = COALESCE($5, image_url),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, date_label, title, excerpt, image_url, created_at, updated_at`,
    [id, dateLabel, title, excerpt, imageUrl],
  );

  return result.rows[0] || null;
}

async function deleteNews(id) {
  const result = await db.query("DELETE FROM news WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
};
