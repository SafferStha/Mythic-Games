'use strict';

/**
 * Standardised API response shapes.
 *
 * All responses follow:
 *   { success: boolean, message: string, data?: any, meta?: any, code?: string, errors?: any[] }
 *
 * Controllers must use these helpers instead of calling res.json() directly,
 * so the contract remains consistent across every endpoint.
 */

/**
 * Send a successful response.
 *
 * @param {import('express').Response} res
 * @param {{ statusCode?, message?, data?, meta? }} options
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const payload = { success: true, message };

  if (data  !== null) payload.data = data;
  if (meta  !== null) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

/**
 * Send an error response.
 *
 * @param {import('express').Response} res
 * @param {{ statusCode?, message?, code?, errors? }} options
 */
const sendError = (res, { statusCode = 500, message = 'Internal server error', code = null, errors = null } = {}) => {
  const payload = { success: false, message };

  if (code   !== null) payload.code   = code;
  if (errors !== null) payload.errors = errors;

  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
