'use strict';

const { pool } = require('../config/database');

const PUBLIC_FIELDS = 'id, name, slug, icon, description, created_at, updated_at';

/**
 * Raw data-access layer for the `categories` table.
 */

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM categories ORDER BY name ASC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM categories WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

async function findBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM categories WHERE slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

async function findByName(name) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM categories WHERE LOWER(name) = LOWER($1)`,
    [name]
  );
  return rows[0] ?? null;
}

async function create({ name, slug, icon = null, description = null }) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug, icon, description)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_FIELDS}`,
    [name, slug, icon, description]
  );
  return rows[0];
}

async function update(id, { name, slug, icon, description }) {
  const { rows } = await pool.query(
    `UPDATE categories
        SET name        = $1,
            slug        = $2,
            icon        = $3,
            description = $4,
            updated_at  = NOW()
      WHERE id = $5
     RETURNING ${PUBLIC_FIELDS}`,
    [name, slug, icon, description, id]
  );
  return rows[0] ?? null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM categories WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}

async function countGamesByCategory(categoryId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total FROM games WHERE category_id = $1 AND status != 'deleted'`,
    [categoryId]
  );
  return parseInt(rows[0].total, 10);
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  findByName,
  countGamesByCategory,
  create,
  update,
  remove,
};
