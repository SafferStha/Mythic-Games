'use strict';

const { pool } = require('../config/database');

// Columns returned to callers — never expose the password hash.
const PUBLIC_FIELDS = 'uid, uid AS user_id, username, email, role, status, created_at, updated_at';
// Include password only for internal auth lookups.
const AUTH_FIELDS   = `${PUBLIC_FIELDS}, password`;

/**
 * Raw data-access layer for the `users` table.
 * No business logic lives here — only SQL operations.
 */

async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users ORDER BY uid DESC`
  );
  return rows;
}

async function findById(userId) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE uid = $1`,
    [userId]
  );
  return rows[0] ?? null;
}

async function findByEmailOrUsername(email, username) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS}
       FROM users
      WHERE LOWER(email) = LOWER($1)
         OR LOWER(username) = LOWER($2)
      LIMIT 1`,
    [email, username]
  );
  return rows[0] ?? null;
}

/** Returns the password hash — use ONLY for authentication. */
async function findByLoginIdentifier(identifier) {
  const { rows } = await pool.query(
    `SELECT ${AUTH_FIELDS}
       FROM users
      WHERE LOWER(email)    = LOWER($1)
         OR LOWER(username) = LOWER($1)
      LIMIT 1`,
    [identifier]
  );
  return rows[0] ?? null;
}

async function create({ username, email, password, role = 'user', status = 'active' }) {
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_FIELDS}`,
    [username, email, password, role, status]
  );
  return rows[0];
}

async function update(userId, { username, email, password, status }) {
  const { rows } = await pool.query(
    `UPDATE users
        SET username   = $1,
            email      = $2,
            password   = $3,
            status     = $4,
            updated_at = NOW()
      WHERE uid = $5
     RETURNING ${PUBLIC_FIELDS}`,
    [username, email, password, status, userId]
  );
  return rows[0] ?? null;
}

async function remove(userId) {
  const result = await pool.query(
    'DELETE FROM users WHERE uid = $1 RETURNING uid',
    [userId]
  );
  return result.rowCount > 0;
}

// ── Admin-only methods ────────────────────────────────────────────────────────

async function findAllPaginated({ page = 1, limit = 20, search = null, status = null, role = null } = {}) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (search) {
    conditions.push(`(LOWER(username) LIKE $${idx} OR LOWER(email) LIKE $${idx})`);
    params.push(`%${search.toLowerCase()}%`);
    idx++;
  }

  if (status) {
    conditions.push(`status = $${idx++}`);
    params.push(status);
  }

  if (role) {
    conditions.push(`role = $${idx++}`);
    params.push(role);
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${PUBLIC_FIELDS}
         FROM users
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, params),
  ]);

  return {
    users: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  };
}

async function updateStatus(userId, status) {
  const { rows } = await pool.query(
    `UPDATE users SET status = $1, updated_at = NOW() WHERE uid = $2 RETURNING ${PUBLIC_FIELDS}`,
    [status, userId]
  );
  return rows[0] ?? null;
}

async function updateRole(userId, role) {
  const { rows } = await pool.query(
    `UPDATE users SET role = $1, updated_at = NOW() WHERE uid = $2 RETURNING ${PUBLIC_FIELDS}`,
    [role, userId]
  );
  return rows[0] ?? null;
}

module.exports = {
  findAll,
  findAllPaginated,
  findById,
  findByEmailOrUsername,
  findByLoginIdentifier,
  create,
  update,
  updateStatus,
  updateRole,
  remove,
};
