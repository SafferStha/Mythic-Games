'use strict';

const { pool } = require('../config/database');

const PUBLIC_FIELDS = 'admin_id, admin_id AS uid, admin_id AS user_id, username, email, role, status, created_at';
const AUTH_FIELDS   = `${PUBLIC_FIELDS}, password`;

/**
 * Raw data-access layer for the `admins` table.
 */

async function findByEmailOrUsername(email, username) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS}
       FROM admins
      WHERE LOWER(email)    = LOWER($1)
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
       FROM admins
      WHERE LOWER(email)    = LOWER($1)
         OR LOWER(username) = LOWER($1)
      LIMIT 1`,
    [identifier]
  );
  return rows[0] ?? null;
}

async function findById(adminId) {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM admins WHERE admin_id = $1`,
    [adminId]
  );
  return rows[0] ?? null;
}

module.exports = {
  findByEmailOrUsername,
  findByLoginIdentifier,
  findById,
};
