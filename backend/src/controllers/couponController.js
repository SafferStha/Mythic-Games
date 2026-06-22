'use strict';

const couponService    = require('../services/couponService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');
const { AppError }     = require('../utils/AppError');

/**
 * POST /checkout/apply-coupon
 * Validates a coupon code against the user's current cart total.
 * Returns discount amount without persisting usage.
 */
const applyCoupon = asyncHandler(async (req, res) => {
  const code       = req.body.code?.trim().toUpperCase();
  const orderTotal = parseFloat(req.body.order_total);

  if (!code)                       throw AppError.badRequest('Coupon code is required',    'CODE_REQUIRED');
  if (!orderTotal || orderTotal <= 0) throw AppError.badRequest('Invalid order total',     'INVALID_TOTAL');

  const result = await couponService.validateCoupon(code, req.user.uid, orderTotal);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    `Coupon "${result.coupon.code}" applied — you save NPR ${result.discountAmount}`,
    data: {
      coupon:          result.coupon,
      discount_amount: result.discountAmount,
      final_total:     Math.max(0, orderTotal - result.discountAmount),
    },
  });
});

module.exports = { applyCoupon };
