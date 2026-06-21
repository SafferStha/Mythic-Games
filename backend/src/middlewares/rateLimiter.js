'use strict';

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/responseFormatter');

const rateLimitHandler = (_req, res) =>
  sendError(res, {
    statusCode: 429,
    message:    'Too many requests. Please try again later.',
    code:       'RATE_LIMIT_EXCEEDED',
  });

/**
 * Strict limiter for auth endpoints (login, register).
 * Prevents brute-force attacks.
 * 10 attempts per IP per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            10,
  standardHeaders: true,
  legacyHeaders:  false,
  handler:        rateLimitHandler,
});

/**
 * General API limiter applied to all routes.
 * 200 requests per IP per 15 minutes — well above normal usage.
 */
const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            200,
  standardHeaders: true,
  legacyHeaders:  false,
  handler:        rateLimitHandler,
});

module.exports = { authLimiter, generalLimiter };
