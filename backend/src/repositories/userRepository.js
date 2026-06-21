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

module.exports = {
  findAll,
  findById,
  findByEmailOrUsername,
  findByLoginIdentifier,
  create,
  update,
  remove,
};
