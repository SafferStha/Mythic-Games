'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `order_items` table.
 *
 * Order items are immutable after creation — they are a financial record
 * snapshot of what was purchased at what price. No update operations.
 */

/**
 * Returns all items for an order.
 */
async function findByOrderId(orderId, db = pool) {
  const { rows } = await db.query(
    `SELECT oi.id, oi.order_id, oi.game_id, oi.quantity,
            oi.price, oi.subtotal, oi.game_title,
            g.slug        AS game_slug,
            g.cover_image AS game_cover_image
       FROM order_items oi
       LEFT JOIN games g ON oi.game_id = g.id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC`,
    [orderId]
  );
  return rows;
}

/**
 * Creates a single order item snapshot.
 * Designed to be called inside a transaction alongside order creation.
 *
 * @param {{ orderId, gameId, quantity, price, subtotal, gameTitle }} data
 * @param {Pool|PoolClient} db
 */
async function create({ orderId, gameId, quantity, price, subtotal, gameTitle }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO order_items (order_id, game_id, quantity, price, subtotal, game_title)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [orderId, gameId ?? null, quantity, price, subtotal, gameTitle]
  );
  return rows[0];
}

/**
 * Bulk-inserts all items for an order in one round-trip.
 * More efficient than looping over individual inserts.
 *
 * @param {Array<{ orderId, gameId, quantity, price, subtotal, gameTitle }>} items
 * @param {Pool|PoolClient} db
 */
async function bulkCreate(items, db = pool) {
  if (!items.length) return [];

  const values  = [];
  const placeholders = items.map((item, i) => {
    const base = i * 6;
    values.push(
      item.orderId,
      item.gameId ?? null,
      item.quantity,
      item.price,
      item.subtotal,
      item.gameTitle
    );
    return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6})`;
  });

  const { rows } = await db.query(
    `INSERT INTO order_items (order_id, game_id, quantity, price, subtotal, game_title)
     VALUES ${placeholders.join(',')}
     RETURNING *`,
    values
  );
  return rows;
}

module.exports = { findByOrderId, create, bulkCreate };
