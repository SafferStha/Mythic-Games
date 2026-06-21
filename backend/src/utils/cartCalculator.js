'use strict';

const env = require('../config/env');

/**
 * Cart calculation utility — the single source of truth for all cart math.
 *
 * Rules:
 *   subtotal   = Σ (item.quantity × item.unit_price)
 *   discount   = bounded between 0 and subtotal (cannot over-discount)
 *   taxable    = subtotal − discount
 *   tax        = taxable × taxRate
 *   grandTotal = taxable + tax
 *
 * All monetary values are rounded to 2 decimal places using
 * "round half away from zero" to avoid floating-point drift.
 *
 * Designed to be stateless and pure — no DB calls, no side effects.
 * Future extensibility: add coupon / region-tax / flash-sale params to `options`.
 */

/**
 * Rounds a monetary value to 2 decimal places.
 * Uses Number.EPSILON to handle IEEE 754 edge cases (e.g. 1.005 → 1.01).
 *
 * @param {number} value
 * @returns {number}
 */
function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Returns the effective purchase price for a game.
 * Applies `discount_price` when it is set, valid, and lower than the base price.
 * Snapshot this value at add-to-cart time — not to be called repeatedly.
 *
 * @param {{ price: number|string, discount_price: number|string|null }} game
 * @returns {number}
 */
function effectivePrice(game) {
  const base     = parseFloat(game.price ?? 0);
  const discount = game.discount_price !== null && game.discount_price !== undefined
    ? parseFloat(game.discount_price)
    : null;

  if (discount !== null && !Number.isNaN(discount) && discount >= 0 && discount < base) {
    return round(discount);
  }

  return round(base);
}

/**
 * Calculates all monetary totals for a cart.
 *
 * @param {Array<{ quantity: number, subtotal: number|string }>} items
 * @param {{
 *   discountAmount?: number,   // flat discount in currency units (e.g. promo code)
 *   taxRate?:        number,   // override the global tax rate (0.13 = 13 %)
 * }} options
 *
 * @returns {{
 *   itemCount:  number,
 *   subtotal:   number,
 *   discount:   number,
 *   taxRate:    number,
 *   tax:        number,
 *   grandTotal: number,
 * }}
 */
function calculateCartTotals(items, {
  discountAmount = 0,
  taxRate        = env.CART_TAX_RATE,
} = {}) {
  // Sum all stored item subtotals — they were computed at add/update time.
  const rawSubtotal = items.reduce((acc, item) => {
    return acc + parseFloat(item.subtotal ?? 0);
  }, 0);

  const subtotal = round(rawSubtotal);

  // Discount cannot exceed the subtotal (guard against negative grandTotal).
  const discount = round(Math.min(Math.max(0, discountAmount), subtotal));

  const taxable   = subtotal - discount;
  const tax       = round(taxable * taxRate);
  const grandTotal = round(taxable + tax);

  const itemCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  return {
    itemCount,
    subtotal,
    discount,
    taxRate,
    tax,
    grandTotal,
  };
}

module.exports = { calculateCartTotals, effectivePrice, round };
