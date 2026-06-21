'use strict';

const { AppError } = require('../utils/AppError');

const isBlank      = (v) => !v || !String(v).trim();
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const VALID_STATUSES = ['active', 'inactive', 'banned'];

/**
 * Validates and normalises a user create/update payload.
 * Throws AppError (400) with field-level `errors` on failure.
 *
 * @param {object} body  Raw request body
 * @returns {{ username: string, email: string, password: string, status: string }}
 */
function validateUserPayload(body) {
  const errors = [];
  const { username, email, password, status } = body ?? {};

  if (isBlank(username))
    errors.push({ field: 'username', message: 'Username is required' });

  if (isBlank(email))
    errors.push({ field: 'email', message: 'Email is required' });
  else if (!isValidEmail(String(email).trim()))
    errors.push({ field: 'email', message: 'Invalid email format' });

  if (isBlank(password))
    errors.push({ field: 'password', message: 'Password is required' });

  const normalizedStatus = isBlank(status) ? 'active' : String(status).trim().toLowerCase();
  if (!VALID_STATUSES.includes(normalizedStatus))
    errors.push({ field: 'status', message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });

  if (errors.length) {
    const err = AppError.badRequest('Validation failed', 'VALIDATION_ERROR');
    err.errors = errors;
    throw err;
  }

  return {
    username: String(username).trim(),
    email:    String(email).trim().toLowerCase(),
    password: String(password),
    status:   normalizedStatus,
  };
}

module.exports = { validateUserPayload };
