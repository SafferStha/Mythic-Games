'use strict';

/**
 * Migration 005 — Admin Logs Schema
 *
 * Tables: admin_logs
 * Also updates users.role CHECK constraint to allow 'super_admin'.
 */
module.exports = async function adminSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id         SERIAL        PRIMARY KEY,
      admin_id   BIGINT        NOT NULL,
      admin_role VARCHAR(20)   NOT NULL,
      action     VARCHAR(100)  NOT NULL,
      entity     VARCHAR(50)   NOT NULL,
      entity_id  VARCHAR(50),
      detail     JSONB,
      ip_address VARCHAR(45),
      created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id   ON admin_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_admin_logs_entity     ON admin_logs(entity);
    CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

    ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
  `);
};
