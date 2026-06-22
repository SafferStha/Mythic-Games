'use strict';

const crypto     = require('crypto');
const { logger } = require('../utils/logger');

/**
 * Attaches a unique correlation ID to every request so all log entries for a
 * single request can be traced across services.  The ID is:
 *   1. Read from the incoming X-Correlation-ID header (set by a gateway/proxy), or
 *   2. Generated as a fresh UUID if not provided.
 *
 * The ID is exposed via res.getHeader('X-Correlation-ID') and logged with every
 * request so it appears in structured log output.
 */
const requestLogger = (req, res, next) => {
  const correlationId =
    req.headers['x-correlation-id'] ||
    crypto.randomUUID();

  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} → ${res.statusCode}  (${duration}ms)`, {
      correlationId,
      method:     req.method,
      url:        req.originalUrl,
      status:     res.statusCode,
      durationMs: duration,
      ip:         req.ip,
    });
  });

  next();
};

module.exports = { requestLogger };
