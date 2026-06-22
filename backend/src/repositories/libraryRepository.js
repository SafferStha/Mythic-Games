'use strict';

const { pool } = require('../config/database');

async function findByUserId(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT l.*, g.cover_image, g.category_id, g.developer, g.publisher,
            g.platform, g.rating, g.status AS game_status,
            c.name AS category_name
       FROM libraries l
       LEFT JOIN games g ON g.id = l.game_id
       LEFT JOIN categories c ON c.id = g.category_id
      WHERE l.user_id = $1
      ORDER BY l.purchase_date DESC`,
    [userId]
  );
  return rows;
}

async function findByUserAndGame(userId, gameId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM libraries WHERE user_id = $1 AND game_id = $2',
    [userId, gameId]
  );
  return rows[0] ?? null;
}

async function isOwned(userId, gameId, db = pool) {
  const { rows } = await db.query(
    'SELECT 1 FROM libraries WHERE user_id = $1 AND game_id = $2 LIMIT 1',
    [userId, gameId]
  );
  return rows.length > 0;
}

async function bulkCreate(entries, db = pool) {
  if (entries.length === 0) return [];

  const values = entries.map(
    (e, i) =>
      `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
  ).join(', ');

  const params = entries.flatMap((e) => [
    e.userId,
    e.gameId,
    e.orderId,
    e.gameTitle,
    e.purchaseDate ?? new Date().toISOString(),
  ]);

  const { rows } = await db.query(
    `INSERT INTO libraries (user_id, game_id, order_id, game_title, purchase_date)
     VALUES ${values}
     ON CONFLICT (user_id, game_id) DO NOTHING
     RETURNING *`,
    params
  );
  return rows;
}

async function getOwnedGameIds(userId, db = pool) {
  const { rows } = await db.query(
    'SELECT game_id FROM libraries WHERE user_id = $1',
    [userId]
  );
  return rows.map((r) => r.game_id);
}

async function countByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) AS total FROM libraries WHERE user_id = $1',
    [userId]
  );
  return parseInt(rows[0].total, 10);
}

module.exports = {
  findByUserId,
  findByUserAndGame,
  isOwned,
  bulkCreate,
  getOwnedGameIds,
  countByUserId,
};
