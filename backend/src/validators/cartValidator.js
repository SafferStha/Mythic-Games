'use strict';

const { AppError } = require('../utils/AppError');

const MAX_QUANTITY_PER_ITEM = 100;

/**
 * Validates and normalises the payload for POST /cart/add.
 *
 * @param {object} body  Raw request body
 * @returns {{ gameId: number, quantity: number }}
 */
function validateAddToCart(body) {
  const errors   = [];
  const { gameId, quantity } = body ?? {};

  // ── gameId ──────────────────────────────────────────────────────────────────
  if (gameId === undefined || gameId === null || gameId === '') {
    errors.push({ field: 'gameId', message: 'gameId is required' });
  } else {
    const parsed = Number(gameId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      errors.push({ field: 'gameId', message: 'gameId must be a positive integer' });
    }
  }

  // ── quantity ─────────────────────────────────────────────────────────────────
  if (quantity === undefined || quantity === null || quantity === '') {
    errors.push({ field: 'quantity', message: 'quantity is required' });
  } else {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.push({ field: 'quantity', message: 'quantity must be a positive integer (minimum 1)' });
    } else if (qty > MAX_QUANTITY_PER_ITEM) {
      errors.push({ field: 'quantity', message: `quantity cannot exceed ${MAX_QUANTITY_PER_ITEM}` });
    }
  }

  if (errors.length) {
    const err = AppError.badRequest('Validation failed', 'VALIDATION_ERROR');
    err.errors = errors;
    throw err;
  }

  return {
    gameId:   Number(gameId),
    quantity: Number(quantity),
  };
}

/**
 * Validates and normalises the payload for PATCH /cart/update/:cartItemId.
 *
 * @param {object} body  Raw request body
 * @returns {{ quantity: number }}
 */
function validateUpdateCartItem(body) {
  const errors   = [];
  const { quantity } = body ?? {};

  if (quantity === undefined || quantity === null || quantity === '') {
    errors.push({ field: 'quantity', message: 'quantity is required' });
  } else {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.push({ field: 'quantity', message: 'quantity must be a positive integer (minimum 1)' });
    } else if (qty > MAX_QUANTITY_PER_ITEM) {
      errors.push({ field: 'quantity', message: `quantity cannot exceed ${MAX_QUANTITY_PER_ITEM}` });
    }
  }

  if (errors.length) {
    const err = AppError.badRequest('Validation failed', 'VALIDATION_ERROR');
    err.errors = errors;
    throw err;
  }

  return { quantity: Number(quantity) };
}

/**
 * Validates and parses the :cartItemId route parameter.
 *
 * @param {object} params  Express req.params
 * @returns {number}       Parsed positive integer
 */
function validateCartItemId(params) {
  const { cartItemId } = params ?? {};
  const id = Number(cartItemId);

  if (!cartItemId || !Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest('cartItemId must be a positive integer', 'INVALID_PARAM');
  }

  return id;
}

module.exports = { validateAddToCart, validateUpdateCartItem, validateCartItemId };
