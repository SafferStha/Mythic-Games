'use strict';

const couponRepository = require('../repositories/couponRepository');
const { AppError }     = require('../utils/AppError');

const POINTS_PER_UNIT = 1; // 1 reward point per NPR spent

/**
 * Validates a coupon code against an order total and returns the discount amount.
 * Does NOT record usage — call recordCouponUsage after the order is confirmed.
 *
 * @param {string}         code
 * @param {number|string}  userId
 * @param {number}         orderTotal
 * @returns {{ coupon, discountAmount: number }}
 */
async function validateCoupon(code, userId, orderTotal) {
  const coupon = await couponRepository.findByCode(code);

  if (!coupon) throw AppError.notFound('Coupon code not found', 'COUPON_NOT_FOUND');
  if (!coupon.is_active) throw AppError.badRequest('This coupon is no longer active', 'COUPON_INACTIVE');

  // Expiry check
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw AppError.badRequest('This coupon has expired', 'COUPON_EXPIRED');
  }

  // Minimum order check
  if (parseFloat(coupon.min_order_value) > 0 && parseFloat(orderTotal) < parseFloat(coupon.min_order_value)) {
    throw AppError.badRequest(
      `Minimum order of NPR ${coupon.min_order_value} required for this coupon`,
      'COUPON_MIN_ORDER_NOT_MET'
    );
  }

  // Usage limit check
  if (coupon.usage_limit != null) {
    const usageCount = await couponRepository.countUsages(coupon.id);
    if (usageCount >= coupon.usage_limit) {
      throw AppError.badRequest('This coupon has reached its usage limit', 'COUPON_USAGE_LIMIT_REACHED');
    }
  }

  // Per-user duplicate check
  const alreadyUsed = await couponRepository.hasUserUsed(coupon.id, userId);
  if (alreadyUsed) {
    throw AppError.conflict('You have already used this coupon', 'COUPON_ALREADY_USED');
  }

  // Calculate discount
  let discountAmount;
  if (coupon.type === 'percentage') {
    discountAmount = parseFloat(orderTotal) * (parseFloat(coupon.value) / 100);
  } else {
    discountAmount = Math.min(parseFloat(coupon.value), parseFloat(orderTotal));
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return { coupon, discountAmount };
}

async function recordCouponUsage({ couponId, userId, orderId }) {
  return couponRepository.recordUsage({ couponId, userId, orderId });
}

// ── Admin operations ──────────────────────────────────────────────────────────

async function listCoupons({ page, limit, isActive } = {}) {
  return couponRepository.findAll({ page, limit, isActive });
}

async function createCoupon({ code, type, value, minOrderValue, usageLimit, expiresAt }) {
  const existing = await couponRepository.findByCode(code);
  if (existing) throw AppError.conflict('Coupon code already exists', 'COUPON_CODE_TAKEN');

  return couponRepository.create({ code, type, value, minOrderValue, usageLimit, expiresAt });
}

async function updateCoupon(id, fields) {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw AppError.notFound('Coupon not found', 'COUPON_NOT_FOUND');

  return couponRepository.update(id, fields);
}

async function deleteCoupon(id) {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw AppError.notFound('Coupon not found', 'COUPON_NOT_FOUND');

  return couponRepository.remove(id);
}

module.exports = {
  validateCoupon,
  recordCouponUsage,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
