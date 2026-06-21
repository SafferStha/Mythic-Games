'use strict';

const { AppError } = require('../utils/AppError');

const isBlank     = (v) => !v || !String(v).trim();
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Validates and normalises a registration payload.
 * Throws AppError (400) with field-level `errors` on failure.
 *
 * @param {object} body  Raw request body
 * @returns {{ username: string, email: string, password: string }}
 */
function validateRegister(body) {
  const errors = [];
  const { username, email, password } = body ?? {};

  if (isBlank(username))
    errors.push({ field: 'username', message: 'Username is required' });
  else if (String(username).trim().length < 3)
    errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
  else if (String(username).trim().length > 50)
    errors.push({ field: 'username', message: 'Username must be at most 50 characters' });

  if (isBlank(email))
    errors.push({ field: 'email', message: 'Email is required' });
  else if (!isValidEmail(String(email).trim()))
    errors.push({ field: 'email', message: 'Invalid email format' });

  if (isBlank(password))
    errors.push({ field: 'password', message: 'Password is required' });
  else if (String(password).length < 8)
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });

  if (errors.length) {
    const err = AppError.badRequest('Validation failed', 'VALIDATION_ERROR');
    err.errors = errors;
    throw err;
  }

  return {
    username: String(username).trim(),
    email:    String(email).trim().toLowerCase(),
    password: String(password),
  };
}

/**
 * Validates and normalises a login payload.
 * Accepts `identifier` (preferred), `email`, or `username` interchangeably.
 *
 * @param {object} body  Raw request body
 * @returns {{ identifier: string, password: string }}
 */
function validateLogin(body) {
  const errors = [];
  const identifier = body?.identifier ?? body?.email ?? body?.username;
  const { password } = body ?? {};

  if (isBlank(identifier))
    errors.push({ field: 'identifier', message: 'Email or username is required' });

  if (isBlank(password))
    errors.push({ field: 'password', message: 'Password is required' });

  if (errors.length) {
    const err = AppError.badRequest('Validation failed', 'VALIDATION_ERROR');
    err.errors = errors;
    throw err;
  }

  return {
    identifier: String(identifier).trim().toLowerCase(),
    password:   String(password),
  };
}

module.exports = { validateRegister, validateLogin };
