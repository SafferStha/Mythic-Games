'use strict';

const { Pool } = require('pg');
const env = require('./env');

function buildConnectionOptions() {
  if (env.DATABASE_URL) {
    return {
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
    user:     env.DB_USER,
    host:     env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port:     env.DB_PORT,
    ssl:      env.DB_SSL ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(buildConnectionOptions());

// Surface pool errors so they don't become silent ghost failures.
pool.on('error', (err) => {
  console.error('[DB] Unexpected idle-client error:', err.message);
});

module.exports = { pool };
