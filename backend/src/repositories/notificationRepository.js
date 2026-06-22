'use strict';

const { pool } = require('../config/database');

async function create({ userId, type, title, message, metadata = null }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, message, metadata ? JSON.stringify(metadata) : null]
  );
  return rows[0];
}

async function findByUserId(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const params = [userId];

  if (unreadOnly) {
    conditions.push('is_read = FALSE');
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT * FROM notifications
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) AS total FROM notifications ${where}`,
    [userId, ...(unreadOnly ? [] : [])]
  );

  return { notifications: rows, total: parseInt(cnt[0].total, 10) };
}

async function countUnread(userId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
  return parseInt(rows[0].total, 10);
}

async function markRead(id, userId, db = pool) {
  const { rows } = await db.query(
    `UPDATE notifications SET is_read = TRUE
      WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0] ?? null;
}

async function markAllRead(userId, db = pool) {
  const { rowCount } = await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
  return rowCount;
}

async function createBulk(entries, db = pool) {
  if (entries.length === 0) return [];

  const values = entries.map(
    (_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`
  ).join(', ');

  const params = entries.flatMap((e) => [
    e.userId, e.type, e.title, e.message,
    e.metadata ? JSON.stringify(e.metadata) : null,
  ]);

  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ${values} RETURNING *`,
    params
  );
  return rows;
}

module.exports = {
  create,
  findByUserId,
  countUnread,
  markRead,
  markAllRead,
  createBulk,
};
