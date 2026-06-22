'use strict';

const { pool } = require('../config/database');

async function findByGameId(gameId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT r.*, u.username
       FROM reviews r
       JOIN users u ON u.uid = r.user_id
      WHERE r.game_id = $1
        AND r.is_visible = TRUE
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
    [gameId, limit, offset]
  );

  const { rows: cnt } = await pool.query(
    'SELECT COUNT(*) AS total FROM reviews WHERE game_id = $1 AND is_visible = TRUE',
    [gameId]
  );

  return { reviews: rows, total: parseInt(cnt[0].total, 10) };
}

async function findByUserAndGame(userId, gameId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM reviews WHERE user_id = $1 AND game_id = $2',
    [userId, gameId]
  );
  return rows[0] ?? null;
}

async function findById(id, db = pool) {
  const { rows } = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
  return rows[0] ?? null;
}

async function create({ userId, gameId, rating, reviewText }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO reviews (user_id, game_id, rating, review_text)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, gameId, rating, reviewText ?? null]
  );
  return rows[0];
}

async function update(id, { rating, reviewText }, db = pool) {
  const { rows } = await db.query(
    `UPDATE reviews
        SET rating      = $1,
            review_text = $2,
            updated_at  = NOW()
      WHERE id = $3
     RETURNING *`,
    [rating, reviewText ?? null, id]
  );
  return rows[0] ?? null;
}

async function remove(id, db = pool) {
  const { rows } = await db.query(
    'DELETE FROM reviews WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] ?? null;
}

async function setVisibility(id, isVisible, db = pool) {
  const { rows } = await db.query(
    'UPDATE reviews SET is_visible = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [isVisible, id]
  );
  return rows[0] ?? null;
}

async function getGameAverageRating(gameId) {
  const { rows } = await pool.query(
    `SELECT
       ROUND(AVG(rating)::numeric, 1) AS average_rating,
       COUNT(*) AS review_count
       FROM reviews
      WHERE game_id = $1 AND is_visible = TRUE`,
    [gameId]
  );
  return {
    average_rating: rows[0].average_rating ? parseFloat(rows[0].average_rating) : null,
    review_count:   parseInt(rows[0].review_count, 10),
  };
}

async function findAllAdmin({ page = 1, limit = 20, isVisible } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (isVisible !== undefined) {
    params.push(isVisible);
    conditions.push(`r.is_visible = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT r.*, u.username, g.title AS game_title
       FROM reviews r
       JOIN users u ON u.uid = r.user_id
       JOIN games g ON g.id  = r.game_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) AS total FROM reviews r ${where}`,
    params.slice(0, -2)
  );

  return { reviews: rows, total: parseInt(cnt[0].total, 10) };
}

module.exports = {
  findByGameId,
  findByUserAndGame,
  findById,
  create,
  update,
  remove,
  setVisibility,
  getGameAverageRating,
  findAllAdmin,
};
