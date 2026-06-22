'use strict';

const { pool } = require('../config/database');

async function findByUserId(userId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM reward_points WHERE user_id = $1',
    [userId]
  );
  return rows[0] ?? null;
}

async function upsertEarn(userId, points, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO reward_points (user_id, total_earned, balance)
     VALUES ($1, $2, $2)
     ON CONFLICT (user_id) DO UPDATE
        SET total_earned = reward_points.total_earned + $2,
            balance      = reward_points.balance      + $2,
            updated_at   = NOW()
     RETURNING *`,
    [userId, points]
  );
  return rows[0];
}

async function spend(userId, points, db = pool) {
  const { rows } = await db.query(
    `UPDATE reward_points
        SET total_spent = total_spent + $2,
            balance     = balance     - $2,
            updated_at  = NOW()
      WHERE user_id = $1
        AND balance >= $2
     RETURNING *`,
    [userId, points]
  );
  return rows[0] ?? null;
}

async function createTransaction({ userId, orderId, type, points, description }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO reward_transactions (user_id, order_id, type, points, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, orderId ?? null, type, points, description]
  );
  return rows[0];
}

async function getTransactions(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT * FROM reward_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const { rows: cnt } = await pool.query(
    'SELECT COUNT(*) AS total FROM reward_transactions WHERE user_id = $1',
    [userId]
  );

  return { transactions: rows, total: parseInt(cnt[0].total, 10) };
}

module.exports = {
  findByUserId,
  upsertEarn,
  spend,
  createTransaction,
  getTransactions,
};
