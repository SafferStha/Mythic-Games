'use strict';

const { AppError } = require('../utils/AppError');
const { sendError } = require('../utils/responseFormatter');
const { logger } = require('../utils/logger');
const env = require('../config/env');

/**
 * Global Express error-handling middleware.
 *
 * Handles three categories:
 *   1. AppError  — operational errors with a known status + code.
 *   2. Known DB / JWT errors — mapped to clean HTTP responses.
 *   3. Everything else  — logged, then masked as 500 in production.
 *
 * Must remain the LAST middleware registered in app.js.
 * The four-argument signature is required by Express to recognise error handlers.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── 1. Operational AppError ─────────────────────────────────────────────
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[AppError] ${err.message}`, {
        method: req.method,
        path:   req.path,
        stack:  env.NODE_ENV !== 'production' ? err.stack : undefined,
      });
    }

    return sendError(res, {
      statusCode: err.statusCode,
      message:    err.message,
      code:       err.code   ?? undefined,
      errors:     err.errors ?? null,
    });
  }

  // ── 2a. PostgreSQL unique constraint violation ───────────────────────────
  if (err.code === '23505') {
    return sendError(res, {
      statusCode: 409,
      message:    'A record with that value already exists',
      code:       'DB_UNIQUE_VIOLATION',
    });
  }

  // ── 2b. PostgreSQL foreign-key violation ────────────────────────────────
  if (err.code === '23503') {
    return sendError(res, {
      statusCode: 400,
      message:    'Referenced resource does not exist',
      code:       'DB_FOREIGN_KEY_VIOLATION',
    });
  }

  // ── 2c. JWT errors ───────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      statusCode: 401,
      message:    'Invalid authentication token',
      code:       'AUTH_TOKEN_INVALID',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      statusCode: 401,
      message:    'Authentication token has expired',
      code:       'AUTH_TOKEN_EXPIRED',
    });
  }

  // ── 3. Unknown / programming error ──────────────────────────────────────
  logger.error(`[UnhandledError] ${err.message}`, {
    method: req.method,
    path:   req.path,
    stack:  err.stack,
  });

  return sendError(res, {
    statusCode: 500,
    message:    env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code:       'INTERNAL_ERROR',
  });
};

module.exports = { errorHandler };
