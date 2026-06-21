'use strict';

const { pool } = require('../config/database');

const ITEM_FIELDS = `
  ci.id, ci.cart_id, ci.game_id, ci.quantity, ci.unit_price, ci.subtotal, ci.added_at,
  g.title       AS game_title,
  g.slug        AS game_slug,
  g.cover_image AS game_cover_image,
  g.price       AS game_current_price,
  g.discount_price AS game_discount_price,
  g.stock       AS game_stock,
  g.status      AS game_status
`;

/**
 * Raw data-access layer for the `cart_items` table.
 * Joins with `games` on reads so callers get enriched item data.
 */

/**
 * Returns all items in a cart, enriched with game data.
 */
async function findByCartId(cartId, db = pool) {
  const { rows } = await db.query(
    `SELECT ${ITEM_FIELDS}
       FROM cart_items ci
       JOIN games g ON ci.game_id = g.id
      WHERE ci.cart_id = $1
      ORDER BY ci.added_at ASC`,
    [cartId]
  );
  return rows;
}

/**
 * Returns a single cart item by ID.
 */
async function findById(itemId, db = pool) {
  const { rows } = await db.query(
    `SELECT ${ITEM_FIELDS}
       FROM cart_items ci
       JOIN games g ON ci.game_id = g.id
      WHERE ci.id = $1`,
    [itemId]
  );
  return rows[0] ?? null;
}

/**
 * Returns the cart item for a specific game in a specific cart, or null.
 * Used to prevent duplicate entries.
 */
async function findByCartAndGame(cartId, gameId, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM cart_items WHERE cart_id = $1 AND game_id = $2`,
    [cartId, gameId]
  );
  return rows[0] ?? null;
}

/**
 * Adds a game to the cart.
 * Caller is responsible for checking duplicate via findByCartAndGame first.
 */
async function create({ cartId, gameId, quantity, unitPrice }, db = pool) {
  const subtotal = parseFloat((quantity * unitPrice).toFixed(2));
  const { rows } = await db.query(
    `INSERT INTO cart_items (cart_id, game_id, quantity, unit_price, subtotal)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [cartId, gameId, quantity, unitPrice, subtotal]
  );
  return rows[0];
}

/**
 * Updates quantity (and recomputes subtotal) for an existing cart item.
 */
async function updateQuantity(itemId, quantity, db = pool) {
  const { rows } = await db.query(
    `UPDATE cart_items
        SET quantity = $1,
            subtotal = quantity * unit_price
      WHERE id = $2
     RETURNING *`,
    [quantity, itemId]
  );
  return rows[0] ?? null;
}

/**
 * Removes a single cart item by ID.
 */
async function remove(itemId, db = pool) {
  const result = await db.query(
    'DELETE FROM cart_items WHERE id = $1 RETURNING id',
    [itemId]
  );
  return result.rowCount > 0;
}

/**
 * Removes all items from a cart (e.g. after checkout or on cart clear).
 */
async function clearByCartId(cartId, db = pool) {
  const result = await db.query(
    'DELETE FROM cart_items WHERE cart_id = $1',
    [cartId]
  );
  return result.rowCount;
}

module.exports = {
  findByCartId,
  findById,
  findByCartAndGame,
  create,
  updateQuantity,
  remove,
  clearByCartId,
};
