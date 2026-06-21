'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `refresh_tokens` table.
 */

/**
 * Persists a new refresh token.
 *
 * @param {{ userId: number|string, userType: string, token: string, expiresAt: Date }} params
 */
async function save({ userId, userType = 'user', token, expiresAt }) {
  const { rows } = await pool.query(
    `INSERT INTO refresh_tokens (user_id, user_type, token, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, userType, token, expiresAt]
  );
  return rows[0];
}

/**
 * Returns a valid (non-revoked, non-expired) token record, or null.
 */
async function findValid(token) {
  const { rows } = await pool.query(
    `SELECT *
       FROM refresh_tokens
      WHERE token      = $1
        AND revoked    = FALSE
        AND expires_at > NOW()
      LIMIT 1`,
    [token]
  );
  return rows[0] ?? null;
}

/** Marks a single token as revoked. */
async function revoke(token) {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1',
    [token]
  );
}

/** Revokes all active refresh tokens for a user (use on password change / forced logout). */
async function revokeAllForUser(userId) {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE',
    [userId]
  );
}

module.exports = { save, findValid, revoke, revokeAllForUser };
