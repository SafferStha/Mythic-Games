'use strict';

const { pool } = require('../config/database');

const GAME_FIELDS = `
  g.id, g.title, g.slug, g.description, g.short_description,
  g.price, g.discount_price, g.stock, g.cover_image, g.banner_image,
  g.category_id, g.publisher, g.developer, g.release_date,
  g.platform, g.rating, g.status, g.created_at, g.updated_at,
  c.name  AS category_name,
  c.slug  AS category_slug
`;

/**
 * Raw data-access layer for the `games` table.
 * Joins with `categories` on every read for denormalised responses.
 */

/**
 * Paginated + filtered game listing.
 *
 * @param {{ page?, limit?, categoryId?, status?, search?, platform? }} opts
 * @returns {{ games: object[], total: number, page: number, limit: number }}
 */
async function findAll({
  page       = 1,
  limit      = 20,
  categoryId = null,
  status     = 'active',
  search     = null,
  platform   = null,
} = {}) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (status) {
    conditions.push(`g.status = $${idx++}`);
    params.push(status);
  }

  if (categoryId) {
    conditions.push(`g.category_id = $${idx++}`);
    params.push(Number(categoryId));
  }

  if (search) {
    conditions.push(
      `(g.title ILIKE $${idx} OR g.short_description ILIKE $${idx} OR g.publisher ILIKE $${idx})`
    );
    params.push(`%${search}%`);
    idx++;
  }

  if (platform) {
    conditions.push(`g.platform ILIKE $${idx++}`);
    params.push(`%${platform}%`);
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${GAME_FIELDS}
         FROM games g
         LEFT JOIN categories c ON g.category_id = c.id
         ${where}
         ORDER BY g.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total
         FROM games g
         ${where}`,
      params
    ),
  ]);

  return {
    games: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  };
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${GAME_FIELDS}
       FROM games g
       LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

async function findBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT ${GAME_FIELDS}
       FROM games g
       LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

async function create({
  title, slug, description, shortDescription, price, discountPrice,
  stock, coverImage, bannerImage, categoryId, publisher, developer,
  releaseDate, platform, rating, status = 'active',
}) {
  const { rows } = await pool.query(
    `INSERT INTO games
       (title, slug, description, short_description, price, discount_price,
        stock, cover_image, banner_image, category_id, publisher, developer,
        release_date, platform, rating, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id, title, slug, price, discount_price, stock, cover_image,
               banner_image, category_id, publisher, developer, release_date,
               platform, rating, status, created_at, updated_at`,
    [
      title, slug, description ?? null, shortDescription ?? null,
      price, discountPrice ?? null, stock ?? 0,
      coverImage ?? null, bannerImage ?? null, categoryId ?? null,
      publisher ?? null, developer ?? null, releaseDate ?? null,
      platform ?? 'PC', rating ?? null, status,
    ]
  );
  return rows[0];
}

async function update(id, {
  title, slug, description, shortDescription, price, discountPrice,
  stock, coverImage, bannerImage, categoryId, publisher, developer,
  releaseDate, platform, rating, status,
}) {
  const { rows } = await pool.query(
    `UPDATE games
        SET title             = $1,
            slug              = $2,
            description       = $3,
            short_description = $4,
            price             = $5,
            discount_price    = $6,
            stock             = $7,
            cover_image       = $8,
            banner_image      = $9,
            category_id       = $10,
            publisher         = $11,
            developer         = $12,
            release_date      = $13,
            platform          = $14,
            rating            = $15,
            status            = $16,
            updated_at        = NOW()
      WHERE id = $17
     RETURNING id, title, slug, price, discount_price, stock, status, updated_at`,
    [
      title, slug, description ?? null, shortDescription ?? null,
      price, discountPrice ?? null, stock,
      coverImage ?? null, bannerImage ?? null, categoryId ?? null,
      publisher ?? null, developer ?? null, releaseDate ?? null,
      platform ?? 'PC', rating ?? null, status, id,
    ]
  );
  return rows[0] ?? null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM games WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

/**
 * Atomically decrements game stock by `quantity`.
 * Returns the updated row, or null if stock is insufficient.
 * Pass a pg client when called inside a transaction.
 *
 * @param {number}         gameId
 * @param {number}         quantity
 * @param {Pool|PoolClient} db  Pool (default) or an active transaction client
 */
async function decrementStock(gameId, quantity, db = pool) {
  const { rows } = await db.query(
    `UPDATE games
        SET stock      = stock - $1,
            updated_at = NOW()
      WHERE id = $2
        AND stock >= $1
     RETURNING id, title, stock`,
    [quantity, gameId]
  );
  return rows[0] ?? null; // null → insufficient stock
}

/**
 * Restore stock (e.g. on order cancellation or payment failure).
 */
async function incrementStock(gameId, quantity, db = pool) {
  const { rows } = await db.query(
    `UPDATE games
        SET stock      = stock + $1,
            updated_at = NOW()
      WHERE id = $2
     RETURNING id, title, stock`,
    [quantity, gameId]
  );
  return rows[0] ?? null;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  remove,
  decrementStock,
  incrementStock,
};
