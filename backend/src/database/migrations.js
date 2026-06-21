'use strict';

const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Runs all schema migrations inside a transaction.
 * Safe to call on every server start — all statements are idempotent.
 */
async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── Users ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS user_uid_seq START 10000000;

      CREATE TABLE IF NOT EXISTS users (
        uid        BIGINT       PRIMARY KEY DEFAULT nextval('user_uid_seq'),
        username   VARCHAR(50)  UNIQUE NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   TEXT         NOT NULL,
        role       VARCHAR(20)  NOT NULL DEFAULT 'user',
        status     VARCHAR(20)  NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      ALTER SEQUENCE user_uid_seq OWNED BY users.uid;

      -- Back-fill role column for databases created before this migration.
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
    `);

    // ── Admins ─────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id   SERIAL       PRIMARY KEY,
        username   VARCHAR(50)  UNIQUE NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   TEXT         NOT NULL,
        role       VARCHAR(20)  NOT NULL DEFAULT 'admin',
        status     VARCHAR(20)  NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // ── Refresh Tokens ─────────────────────────────────────────────────────
    // user_id stores both users.uid (BIGINT) and admins.admin_id (INTEGER).
    // No FK constraint intentionally — FK to two different tables isn't possible.
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         SERIAL       PRIMARY KEY,
        user_id    BIGINT       NOT NULL,
        user_type  VARCHAR(10)  NOT NULL DEFAULT 'user',
        token      TEXT         UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ  NOT NULL,
        revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token
        ON refresh_tokens (token)
        WHERE revoked = FALSE;
    `);

    await client.query('COMMIT');
    logger.info('Database migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Database migration failed — transaction rolled back', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

async function getConnectionInfo() {
  const result = await pool.query(
    'SELECT current_database() AS database, inet_server_addr() AS host, inet_server_port() AS port'
  );
  return result.rows[0];
}

module.exports = { runMigrations, getConnectionInfo };
