'use strict';

const { AppError } = require('../utils/AppError');
const { ROLES }    = require('../constants/roles');

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * Middleware: allows any admin or super_admin through.
 * Must be placed after `authenticate`.
 */
const requireAdmin = (req, _res, next) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }

  const role = String(req.user.role ?? '').toLowerCase();

  if (!ADMIN_ROLES.includes(role)) {
    throw AppError.forbidden('Admin access required', 'AUTH_FORBIDDEN');
  }

  next();
};

/**
 * Middleware: allows only super_admin through.
 * Use for user role promotion and admin management.
 */
const requireSuperAdmin = (req, _res, next) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }

  if (String(req.user.role ?? '').toLowerCase() !== ROLES.SUPER_ADMIN) {
    throw AppError.forbidden('Super-admin access required', 'AUTH_FORBIDDEN');
  }

  next();
};

module.exports = { requireAdmin, requireSuperAdmin };
