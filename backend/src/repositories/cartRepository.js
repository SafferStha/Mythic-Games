'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `carts` table.
 */

async function findById(cartId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM carts WHERE id = $1',
    [cartId]
  );
  return rows[0] ?? null;
}

/**
 * Returns the single active cart for a user, or null.
 */
async function findActiveByUserId(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM carts
      WHERE user_id = $1
        AND status  = 'active'
      LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

/**
 * Returns all carts (any status) for a user.
 */
async function findAllByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM carts
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Creates a new active cart for the given user.
 */
async function create(userId, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO carts (user_id, status)
     VALUES ($1, 'active')
     RETURNING *`,
    [userId]
  );
  return rows[0];
}

/**
 * Finds the active cart or creates one if none exists.
 * Always returns a cart — use this before any cart-item operation.
 */
async function findOrCreate(userId, db = pool) {
  const existing = await findActiveByUserId(userId, db);
  return existing ?? create(userId, db);
}

/**
 * Updates the cart status (active → converted | abandoned).
 */
async function updateStatus(cartId, status, db = pool) {
  const { rows } = await db.query(
    `UPDATE carts
        SET status     = $1,
            updated_at = NOW()
      WHERE id = $2
     RETURNING *`,
    [status, cartId]
  );
  return rows[0] ?? null;
}

module.exports = {
  findById,
  findActiveByUserId,
  findAllByUserId,
  create,
  findOrCreate,
  updateStatus,
};
