"use strict";

const { pool } = require("../config/database");
const { logger } = require("../utils/logger");

const schema001Auth = require("./schema/001_auth");
const schema002Catalog = require("./schema/002_catalog");
const schema003Commerce = require("./schema/003_commerce");
const schema004Payments = require("./schema/004_payments");

/**
 * Ordered list of all migrations.
 * NEVER reorder or rename existing entries — that will cause already-applied
 * migrations to be re-run on older databases.
 * To change an existing migration, add a new entry instead.
 */
const MIGRATIONS = [
  { name: "001_auth_schema", up: schema001Auth },
  { name: "002_catalog_schema", up: schema002Catalog },
  { name: "003_commerce_schema", up: schema003Commerce },
  { name: "004_payments_schema", up: schema004Payments },
];

/**
 * Creates the schema_migrations tracking table if it does not exist.
 * Runs outside any application transaction so it is always available.
 */
async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL       PRIMARY KEY,
      name       VARCHAR(100) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

/**
 * Returns the set of migration names that have already been applied.
 */
async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    "SELECT name FROM schema_migrations ORDER BY id",
  );
  return new Set(rows.map((r) => r.name));
}

/**
 * Runs all pending migrations in version order.
 *
 * Each migration executes inside its own transaction so a failure in
 * migration N does not roll back the already-committed migrations 1…N-1.
 * The server will exit if any migration fails — a human must intervene.
 */
async function runMigrations() {
  const client = await pool.connect();

  try {
    // Tracking table is created outside any migration transaction.
    await ensureTrackingTable(client);

    const applied = await getAppliedMigrations(client);
    const pending = MIGRATIONS.filter((m) => !applied.has(m.name));

    if (pending.length === 0) {
      logger.info("Database schema is up to date — no pending migrations");
      return;
    }

    logger.info(`Running ${pending.length} pending migration(s)`);

    for (const migration of pending) {
      logger.info(`Applying migration: ${migration.name}`);

      await client.query("BEGIN");
      try {
        await migration.up(client);

        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          migration.name,
        ]);

        await client.query("COMMIT");
        logger.info(`Migration applied: ${migration.name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        logger.error(`Migration failed: ${migration.name}`, {
          error: error.message,
        });
        throw error; // propagates to startServer → process.exit(1)
      }
    }

    logger.info("All migrations completed successfully");
  } finally {
    client.release();
  }
}

/**
 * Returns basic connection metadata for startup logging.
 */
async function getConnectionInfo() {
  const { rows } = await pool.query(
    "SELECT current_database() AS database, inet_server_addr() AS host, inet_server_port() AS port",
  );
  return rows[0];
}

module.exports = { runMigrations, getConnectionInfo };
