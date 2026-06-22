'use strict';

const { pool } = require('../config/database');

async function findByUserId(userId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM wishlists WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] ?? null;
}

async function findOrCreate(userId, db = pool) {
  const existing = await findByUserId(userId, db);
  if (existing) return existing;

  const { rows } = await db.query(
    'INSERT INTO wishlists (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return rows[0];
}

async function getItems(wishlistId, db = pool) {
  const { rows } = await db.query(
    `SELECT wi.id, wi.added_at,
            g.id AS game_id, g.title, g.slug, g.price, g.discount_price,
            g.cover_image, g.status AS game_status, g.developer, g.publisher,
            g.platform, g.rating,
            c.name AS category_name
       FROM wishlist_items wi
       JOIN games g ON g.id = wi.game_id
       LEFT JOIN categories c ON c.id = g.category_id
      WHERE wi.wishlist_id = $1
      ORDER BY wi.added_at DESC`,
    [wishlistId]
  );
  return rows;
}

async function findItem(wishlistId, gameId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM wishlist_items WHERE wishlist_id = $1 AND game_id = $2',
    [wishlistId, gameId]
  );
  return rows[0] ?? null;
}

async function addItem(wishlistId, gameId, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO wishlist_items (wishlist_id, game_id)
     VALUES ($1, $2)
     ON CONFLICT (wishlist_id, game_id) DO NOTHING
     RETURNING *`,
    [wishlistId, gameId]
  );
  return rows[0] ?? null;
}

async function removeItem(wishlistItemId, db = pool) {
  const { rows } = await db.query(
    'DELETE FROM wishlist_items WHERE id = $1 RETURNING *',
    [wishlistItemId]
  );
  return rows[0] ?? null;
}

async function removeItemByGameId(wishlistId, gameId, db = pool) {
  const { rows } = await db.query(
    'DELETE FROM wishlist_items WHERE wishlist_id = $1 AND game_id = $2 RETURNING *',
    [wishlistId, gameId]
  );
  return rows[0] ?? null;
}

async function countByWishlistId(wishlistId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) AS total FROM wishlist_items WHERE wishlist_id = $1',
    [wishlistId]
  );
  return parseInt(rows[0].total, 10);
}

module.exports = {
  findByUserId,
  findOrCreate,
  getItems,
  findItem,
  addItem,
  removeItem,
  removeItemByGameId,
  countByWishlistId,
};
