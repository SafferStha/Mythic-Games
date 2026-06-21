'use strict';

const { AppError } = require('../utils/AppError');
const { ROLES } = require('../constants/roles');

/**
 * Role-based authorisation middleware factory.
 * Must be placed AFTER `authenticate` (which populates req.user).
 *
 * @param {...string} allowedRoles  One or more roles permitted to access the route.
 * @returns {Function} Express middleware
 *
 * @example
 *   router.get('/admin-only', authenticate, authorize(ROLES.ADMIN), handler)
 *   router.get('/users-and-admins', authenticate, authorize(ROLES.USER, ROLES.ADMIN), handler)
 */
const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required before authorization', 'AUTH_TOKEN_MISSING');
  }

  const userRole    = String(req.user.role ?? ROLES.USER).toLowerCase();
  const normalised  = allowedRoles.map((r) => String(r).toLowerCase());

  if (!normalised.includes(userRole)) {
    throw AppError.forbidden(
      'You do not have permission to access this resource',
      'AUTH_FORBIDDEN'
    );
  }

  next();
};

module.exports = { authorize };
