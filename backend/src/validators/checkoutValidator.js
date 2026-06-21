'use strict';

const { AppError } = require('../utils/AppError');

/**
 * Validates and normalises the optional body for POST /checkout.
 *
 * Currently only `notes` is accepted.
 * Future fields (couponCode, giftCardCode, shippingAddress) go here.
 *
 * @param {object} body  Raw request body (may be empty)
 * @returns {{ notes: string|null }}
 */
function validateCheckoutBody(body) {
  const { notes } = body ?? {};

  return {
    // Sanitise and cap notes at 500 chars; null if blank
    notes: notes != null
      ? (String(notes).trim().slice(0, 500) || null)
      : null,
  };
}

/**
 * Validates and parses the :orderId route parameter.
 *
 * @param {object} params  Express req.params
 * @returns {number}       Parsed positive integer
 */
function validateOrderId(params) {
  const { orderId } = params ?? {};
  const id = Number(orderId);

  if (!orderId || !Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('orderId must be a positive integer', 'INVALID_PARAM');
  }

  return id;
}

module.exports = { validateCheckoutBody, validateOrderId };
