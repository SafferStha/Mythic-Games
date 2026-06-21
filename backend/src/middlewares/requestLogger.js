'use strict';

const { logger } = require('../utils/logger');

/**
 * Logs every incoming HTTP request with method, URL, status, and duration.
 * Attaches to `res.finish` so status code is available after the response is sent.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} → ${res.statusCode}  (${duration}ms)`);
  });

  next();
};

module.exports = { requestLogger };
