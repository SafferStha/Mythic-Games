'use strict';

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');

const userRepository  = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');
const tokenRepository = require('../repositories/tokenRepository');
const { AppError }    = require('../utils/AppError');
const { ROLES }       = require('../constants/roles');
const env             = require('../config/env');

const BCRYPT_ROUNDS        = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Token helpers ─────────────────────────────────────────────────────────────

function issueAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function generateRefreshToken() {
  // 40 random bytes → 80-char hex string. Not a JWT — validated against DB.
  return crypto.randomBytes(40).toString('hex');
}

async function issueTokenPair(userId, userType, tokenPayload) {
  const accessToken  = issueAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken();
  const expiresAt    = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await tokenRepository.save({ userId, userType, token: refreshToken, expiresAt });

  return { accessToken, refreshToken };
}

// ── Sanitisers ────────────────────────────────────────────────────────────────
// Strip password and other internal fields before returning to the controller.

function sanitizeUser(user) {
  return {
    uid:        user.uid,
    user_id:    user.user_id  ?? user.uid,
    username:   user.username,
    email:      user.email,
    role:       user.role     ?? ROLES.USER,
    status:     user.status,
    created_at: user.created_at,
    updated_at: user.updated_at ?? null,
  };
}

function sanitizeAdmin(admin) {
  return {
    admin_id:   admin.admin_id,
    uid:        admin.uid,
    user_id:    admin.user_id  ?? admin.uid,
    username:   admin.username,
    email:      admin.email,
    role:       admin.role     ?? ROLES.ADMIN,
    status:     admin.status,
    created_at: admin.created_at,
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function verifyPassword(plain, hashed) {
  // Support both bcrypt hashes and legacy plain-text (dev-only) passwords.
  return hashed?.startsWith('$2')
    ? bcrypt.compare(plain, hashed)
    : hashed === plain;
}

// ── Public service methods ────────────────────────────────────────────────────

/**
 * Register a new user account.
 * Checks both users and admins tables for email/username uniqueness.
 *
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
async function register({ username, email, password }) {
  const [existingUser, existingAdmin] = await Promise.all([
    userRepository.findByEmailOrUsername(email, username),
    adminRepository.findByEmailOrUsername(email, username),
  ]);

  if (existingUser || existingAdmin) {
    throw AppError.conflict(
      'An account with that email or username already exists',
      'AUTH_DUPLICATE'
    );
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user   = await userRepository.create({ username, email, password: hashed });

  const tokenPayload = { sub: String(user.uid), uid: user.uid, username: user.username, email: user.email, role: user.role };
  const { accessToken, refreshToken } = await issueTokenPair(user.uid, 'user', tokenPayload);

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

/**
 * Authenticate a user or admin by identifier + password.
 * Admin accounts take priority when the same identifier matches both tables.
 *
 * @param {{ identifier: string, password: string }} payload
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
async function login({ identifier, password }) {
  const [admin, user] = await Promise.all([
    adminRepository.findByLoginIdentifier(identifier),
    userRepository.findByLoginIdentifier(identifier),
  ]);

  if (!admin && !user) {
    throw AppError.unauthorized('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
  }

  // Admin authentication path
  if (admin) {
    if (admin.status !== 'active') {
      throw AppError.forbidden('This admin account is inactive', 'AUTH_ACCOUNT_INACTIVE');
    }

    if (!(await verifyPassword(password, admin.password))) {
      throw AppError.unauthorized('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
    }

    const tokenPayload = { sub: String(admin.admin_id), uid: admin.admin_id, username: admin.username, email: admin.email, role: admin.role };
    const { accessToken, refreshToken } = await issueTokenPair(admin.admin_id, 'admin', tokenPayload);

    return { user: sanitizeAdmin(admin), accessToken, refreshToken };
  }

  // User authentication path
  if (user.status !== 'active') {
    throw AppError.forbidden('This account is inactive', 'AUTH_ACCOUNT_INACTIVE');
  }

  if (!(await verifyPassword(password, user.password))) {
    throw AppError.unauthorized('Invalid credentials', 'AUTH_INVALID_CREDENTIALS');
  }

  const tokenPayload = { sub: String(user.uid), uid: user.uid, username: user.username, email: user.email, role: user.role };
  const { accessToken, refreshToken } = await issueTokenPair(user.uid, 'user', tokenPayload);

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

/**
 * Issue a new access token from a valid refresh token.
 * Does NOT rotate the refresh token (rotation strategy is Phase 7).
 *
 * @param {string} refreshToken
 * @returns {{ accessToken: string }}
 */
async function refreshAccessToken(refreshToken) {
  const record = await tokenRepository.findValid(refreshToken);

  if (!record) {
    throw AppError.unauthorized('Invalid or expired refresh token', 'AUTH_TOKEN_INVALID');
  }

  let account;
  if (record.user_type === 'admin') {
    account = await adminRepository.findById(record.user_id);
  } else {
    account = await userRepository.findById(record.user_id);
  }

  if (!account || account.status !== 'active') {
    await tokenRepository.revoke(refreshToken);
    throw AppError.unauthorized('Account not found or inactive', 'AUTH_ACCOUNT_INACTIVE');
  }

  const tokenPayload = {
    sub:      String(account.uid ?? account.admin_id),
    uid:      account.uid ?? account.admin_id,
    username: account.username,
    email:    account.email,
    role:     account.role,
  };

  return { accessToken: issueAccessToken(tokenPayload) };
}

/**
 * Revoke a refresh token (logout).
 *
 * @param {string|undefined} refreshToken
 */
async function logout(refreshToken) {
  if (refreshToken) {
    await tokenRepository.revoke(refreshToken);
  }
}

module.exports = { register, login, refreshAccessToken, logout };
