'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `admin_logs` table.
 */

async function create({ adminId, adminRole, action, entity, entityId = null, detail = null, ipAddress = null }) {
  const { rows } = await pool.query(
    `INSERT INTO admin_logs (admin_id, admin_role, action, entity, entity_id, detail, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [adminId, adminRole, action, entity, entityId ? String(entityId) : null,
     detail ? JSON.stringify(detail) : null, ipAddress ?? null]
  );
  return rows[0];
}

async function findAll({ page = 1, limit = 50, adminId = null, entity = null } = {}) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (adminId) {
    conditions.push(`admin_id = $${idx++}`);
    params.push(adminId);
  }

  if (entity) {
    conditions.push(`entity = $${idx++}`);
    params.push(entity);
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM admin_logs ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) AS total FROM admin_logs ${where}`, params),
  ]);

  return {
    logs:  dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  };
}

module.exports = { create, findAll };
