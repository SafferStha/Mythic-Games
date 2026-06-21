'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Verifies the Bearer JWT on the Authorization header and attaches the
 * decoded payload to `req.user`.
 *
 * Usage:  router.get('/protected', authenticate, handler)
 *
 * Token payload shape: { sub, uid, username, email, role, iat, exp }
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('No authentication token provided', 'AUTH_TOKEN_MISSING');
  }

  const token   = authHeader.slice(7); // strip "Bearer "
  const decoded = jwt.verify(token, env.JWT_SECRET);

  req.user = decoded;
  next();
});

module.exports = { authenticate };
