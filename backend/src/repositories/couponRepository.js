'use strict';

const { pool } = require('../config/database');

async function findById(id, db = pool) {
  const { rows } = await db.query('SELECT * FROM coupons WHERE id = $1', [id]);
  return rows[0] ?? null;
}

async function findByCode(code, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1)',
    [code]
  );
  return rows[0] ?? null;
}

async function findAll({ page = 1, limit = 20, isActive } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (isActive !== undefined) {
    params.push(isActive);
    conditions.push(`is_active = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT c.*,
            COUNT(cu.id) AS usage_count
       FROM coupons c
       LEFT JOIN coupon_usages cu ON cu.coupon_id = c.id
      ${where}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) AS total FROM coupons ${where}`,
    params.slice(0, -2)
  );

  return { coupons: rows, total: parseInt(cnt[0].total, 10) };
}

async function create({ code, type, value, minOrderValue, usageLimit, expiresAt, isActive = true }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO coupons (code, type, value, min_order_value, usage_limit, expires_at, is_active)
     VALUES (UPPER($1), $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [code, type, value, minOrderValue ?? 0, usageLimit ?? null, expiresAt ?? null, isActive]
  );
  return rows[0];
}

async function update(id, fields, db = pool) {
  const sets = [];
  const params = [];

  const allowed = ['code', 'type', 'value', 'min_order_value', 'usage_limit', 'expires_at', 'is_active'];
  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      params.push(val);
      sets.push(`${key} = $${params.length}`);
    }
  }

  if (sets.length === 0) return findById(id, db);

  params.push(new Date().toISOString(), id);
  const { rows } = await db.query(
    `UPDATE coupons SET ${sets.join(', ')}, updated_at = $${params.length - 1}
      WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

async function remove(id) {
  const { rows } = await pool.query(
    'DELETE FROM coupons WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] ?? null;
}

async function countUsages(couponId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*) AS total FROM coupon_usages WHERE coupon_id = $1',
    [couponId]
  );
  return parseInt(rows[0].total, 10);
}

async function hasUserUsed(couponId, userId, db = pool) {
  const { rows } = await db.query(
    'SELECT 1 FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2 LIMIT 1',
    [couponId, userId]
  );
  return rows.length > 0;
}

async function recordUsage({ couponId, userId, orderId }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1, $2, $3) RETURNING *`,
    [couponId, userId, orderId]
  );
  return rows[0];
}

module.exports = {
  findById,
  findByCode,
  findAll,
  create,
  update,
  remove,
  countUsages,
  hasUserUsed,
  recordUsage,
};
