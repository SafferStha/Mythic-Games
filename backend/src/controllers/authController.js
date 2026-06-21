'use strict';

const authService                    = require('../services/authService');
const { validateRegister,
        validateLogin }              = require('../validators/authValidator');
const { asyncHandler }               = require('../utils/asyncHandler');
const { sendSuccess }                = require('../utils/responseFormatter');
const { HTTP_STATUS }                = require('../constants/httpStatus');
const env                            = require('../config/env');

const REFRESH_COOKIE = 'mythic_refresh_token';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,                             // not readable by JS
    secure:   env.NODE_ENV === 'production',    // HTTPS-only in prod
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,         // 7 days in ms
  });
}

/**
 * POST /api/auth/register
 *
 * Response shape (backward-compatible with frontend setStoredUser):
 *   { success, message, data: { uid, user_id, username, email, role, status,
 *                               created_at, updated_at, token } }
 * The refresh token is written into an httpOnly cookie (invisible to JS).
 */
const register = asyncHandler(async (req, res) => {
  const payload = validateRegister(req.body);
  const { user, accessToken, refreshToken } = await authService.register(payload);

  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message:    'Registration successful',
    data:       { ...user, token: accessToken },
  });
});

/**
 * POST /api/auth/login
 *
 * Same response shape as register — token is flattened into the user object
 * so existing frontend consumers (setStoredUser) continue to work unchanged.
 */
const login = asyncHandler(async (req, res) => {
  const payload = validateLogin(req.body);
  const { user, accessToken, refreshToken } = await authService.login(payload);

  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Login successful',
    data:       { ...user, token: accessToken },
  });
});

/**
 * POST /api/auth/refresh
 * Reads the refresh token from the httpOnly cookie and issues a new access token.
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];

  if (!refreshToken) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Refresh token not provided',
      code:    'AUTH_TOKEN_MISSING',
    });
  }

  const { accessToken } = await authService.refreshAccessToken(refreshToken);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Token refreshed successfully',
    data:       { token: accessToken },
  });
});

/**
 * POST /api/auth/logout  (requires authentication)
 * Revokes the refresh token stored in the cookie.
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];

  await authService.logout(refreshToken);
  res.clearCookie(REFRESH_COOKIE);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Logged out successfully',
  });
});

module.exports = { register, login, refresh, logout };
