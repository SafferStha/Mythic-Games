'use strict';

require('dotenv').config();

const optional = (name, defaultValue = '') =>
  process.env[name]?.trim() || defaultValue;

/**
 * Centralised, validated environment configuration.
 * All process.env access in the application must go through this module.
 */
const env = Object.freeze({
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: Number(optional('PORT', '5000')),

  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: optional('DATABASE_URL'),
  DB_HOST:      optional('DB_HOST', 'localhost'),
  DB_PORT:      Number(optional('DB_PORT', '5432')),
  DB_NAME:      optional('DB_NAME'),
  DB_USER:      optional('DB_USER'),
  DB_PASSWORD:  optional('DB_PASSWORD'),
  DB_SSL:       optional('DB_SSL', 'false') === 'true',

  // ── JWT ───────────────────────────────────────────────────────────────────
  // In production these MUST be strong random secrets (≥ 32 chars).
  JWT_SECRET:          optional('JWT_SECRET',          'mythic-dev-secret-change-in-production'),
  JWT_REFRESH_SECRET:  optional('JWT_REFRESH_SECRET',  'mythic-dev-refresh-change-in-production'),
  JWT_EXPIRES_IN:      optional('JWT_EXPIRES_IN',      '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),
});

module.exports = env;
