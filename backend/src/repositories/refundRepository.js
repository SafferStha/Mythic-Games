'use strict';

const { pool } = require('../config/database');

async function findById(id, db = pool) {
  const { rows } = await db.query('SELECT * FROM refunds WHERE id = $1', [id]);
  return rows[0] ?? null;
}

async function findByOrderId(orderId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM refunds WHERE order_id = $1',
    [orderId]
  );
  return rows[0] ?? null;
}

async function findByUserId(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT r.*, o.order_number, o.grand_total
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const { rows: cnt } = await pool.query(
    'SELECT COUNT(*) AS total FROM refunds WHERE user_id = $1',
    [userId]
  );

  return { refunds: rows, total: parseInt(cnt[0].total, 10) };
}

async function findAll({ page = 1, limit = 20, status } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`r.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT r.*, o.order_number, o.grand_total, u.username, u.email
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
       JOIN users  u ON u.uid = r.user_id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) AS total FROM refunds r ${where}`,
    params.slice(0, -2)
  );

  return { refunds: rows, total: parseInt(cnt[0].total, 10) };
}

async function create({ orderId, userId, reason }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO refunds (order_id, user_id, reason)
     VALUES ($1, $2, $3) RETURNING *`,
    [orderId, userId, reason]
  );
  return rows[0];
}

async function updateStatus(id, { status, adminNotes }, db = pool) {
  const { rows } = await db.query(
    `UPDATE refunds
        SET status      = $1,
            admin_notes = $2,
            updated_at  = NOW()
      WHERE id = $3
     RETURNING *`,
    [status, adminNotes ?? null, id]
  );
  return rows[0] ?? null;
}

module.exports = {
  findById,
  findByOrderId,
  findByUserId,
  findAll,
  create,
  updateStatus,
};
