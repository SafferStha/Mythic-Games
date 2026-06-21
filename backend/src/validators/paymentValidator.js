'use strict';

const { AppError } = require('../utils/AppError');

/**
 * Validates POST /payment/esewa/initiate body.
 * @param {object} body
 * @returns {{ orderId: number }}
 */
function validateInitiatePayment(body) {
  const { orderId } = body ?? {};
  const id = Number(orderId);

  if (!orderId || !Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('orderId must be a positive integer', 'INVALID_PARAM');
  }

  return { orderId: id };
}

/**
 * Validates POST /payment/esewa/verify body.
 * @param {object} body
 * @returns {{ transactionUuid: string }}
 */
function validateVerifyPayment(body) {
  const { transactionUuid } = body ?? {};
  const uuid = String(transactionUuid ?? '').trim();

  if (!uuid) {
    throw AppError.badRequest('transactionUuid is required', 'INVALID_PARAM');
  }

  return { transactionUuid: uuid };
}

/**
 * Validates the ?data= query param on eSewa callbacks.
 * Returns the raw base64 string for the service layer to decode.
 *
 * NOTE: Does NOT throw — callback endpoints must handle missing data
 * gracefully to avoid leaking error details to the public internet.
 *
 * @param {object} query  Express req.query
 * @returns {string|null}
 */
function extractCallbackData(query) {
  const raw = String(query?.data ?? '').trim();
  return raw || null;
}

module.exports = { validateInitiatePayment, validateVerifyPayment, extractCallbackData };
