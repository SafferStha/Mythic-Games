'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long!!';
const JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!!';

/**
 * Generate a test access token for a user.
 */
function makeUserToken(overrides = {}) {
  const payload = {
    sub:      '10000001',
    uid:      10000001,
    username: 'testuser',
    email:    'testuser@example.com',
    role:     'user',
    ...overrides,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generate a test access token for an admin.
 */
function makeAdminToken(overrides = {}) {
  const payload = {
    sub:      '1',
    uid:      1,
    username: 'testadmin',
    email:    'testadmin@example.com',
    role:     'admin',
    ...overrides,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generate a test access token for a super admin.
 */
function makeSuperAdminToken(overrides = {}) {
  return makeAdminToken({ role: 'super_admin', ...overrides });
}

/**
 * Generate an expired test token.
 */
function makeExpiredToken() {
  return jwt.sign(
    { sub: '10000001', uid: 10000001, username: 'test', email: 'test@test.com', role: 'user' },
    JWT_SECRET,
    { expiresIn: '-1s' }
  );
}

module.exports = { makeUserToken, makeAdminToken, makeSuperAdminToken, makeExpiredToken };
