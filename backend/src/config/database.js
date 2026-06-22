'use strict';

const { Pool } = require('pg');
const env = require('./env');

// ── Pool settings ─────────────────────────────────────────────────────────────
// Explicit limits prevent silent exhaustion under load.
// max: 20 — enough for production traffic without overwhelming PostgreSQL
// idleTimeoutMillis: 30s — release idle clients before pgBouncer times out
// connectionTimeoutMillis: 5s — fail fast if the DB is unreachable
const POOL_CONFIG = {
  max:                    20,
  idleTimeoutMillis:      30_000,
  connectionTimeoutMillis: 5_000,
};

function buildConnectionOptions() {
  if (env.DATABASE_URL) {
    return {
      ...POOL_CONFIG,
      connectionString: env.DATABASE_URL,
      ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    };
  }

  if (!env.DB_NAME) {
    throw new Error(
      'PostgreSQL configuration is missing. ' +
      'Set DATABASE_URL or DB_NAME in backend/.env'
    );
  }

  return {
    ...POOL_CONFIG,
    user:     env.DB_USER,
    host:     env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port:     env.DB_PORT,
    ssl:      env.DB_SSL ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(buildConnectionOptions());

// Surface pool errors through the application logger rather than stderr.
pool.on('error', (err) => {
  // Lazy-require to avoid circular dependency during startup
  try {
    const { logger } = require('../utils/logger');
    logger.error('[DB] Unexpected idle-client error', { error: err.message });
  } catch {
    console.error('[DB] Unexpected idle-client error:', err.message);
  }
});

module.exports = { pool };
