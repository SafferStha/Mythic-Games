'use strict';

/**
 * Migration 001 — Auth Schema
 *
 * Tables: users, admins, refresh_tokens
 * This migration preserves any existing data — all statements are fully idempotent.
 */
module.exports = async function authSchema(client) {
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

    -- Back-fill role column for databases created before Phase 1.
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

    CREATE TABLE IF NOT EXISTS admins (
      admin_id   SERIAL       PRIMARY KEY,
      username   VARCHAR(50)  UNIQUE NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   TEXT         NOT NULL,
      role       VARCHAR(20)  NOT NULL DEFAULT 'admin',
      status     VARCHAR(20)  NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    -- user_id stores both users.uid (BIGINT) and admins.admin_id (INTEGER).
    -- No FK constraint — PostgreSQL does not support FK to two parent tables.
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
};
