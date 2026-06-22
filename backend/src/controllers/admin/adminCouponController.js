'use strict';

const couponService    = require('../../services/couponService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { sendSuccess }  = require('../../utils/responseFormatter');
const { HTTP_STATUS }  = require('../../constants/httpStatus');
const { AppError }     = require('../../utils/AppError');

const listCoupons = asyncHandler(async (req, res) => {
  const page     = Math.max(1, parseInt(req.query.page ?? '1', 10));
  const limit    = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
  const isActive = req.query.active !== undefined
    ? req.query.active === 'true'
    : undefined;

  const result = await couponService.listCoupons({ page, limit, isActive });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Coupons retrieved',
    data:       result,
  });
});

const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, min_order_value, usage_limit, expires_at } = req.body;

  if (!code?.trim())           throw AppError.badRequest('Coupon code is required', 'CODE_REQUIRED');
  if (!['percentage', 'fixed'].includes(type)) {
    throw AppError.badRequest('type must be "percentage" or "fixed"', 'INVALID_TYPE');
  }
  if (!value || parseFloat(value) <= 0) {
    throw AppError.badRequest('value must be a positive number', 'INVALID_VALUE');
  }
  if (type === 'percentage' && parseFloat(value) > 100) {
    throw AppError.badRequest('Percentage discount cannot exceed 100', 'INVALID_PERCENTAGE');
  }

  const coupon = await couponService.createCoupon({
    code:          code.trim(),
    type,
    value:         parseFloat(value),
    minOrderValue: min_order_value ? parseFloat(min_order_value) : 0,
    usageLimit:    usage_limit     ? parseInt(usage_limit, 10)   : null,
    expiresAt:     expires_at      ?? null,
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message:    'Coupon created',
    data:       { coupon },
  });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) throw AppError.badRequest('Invalid coupon ID', 'INVALID_ID');

  const allowed = ['code', 'type', 'value', 'min_order_value', 'usage_limit', 'expires_at', 'is_active'];
  const fields  = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  const coupon = await couponService.updateCoupon(id, fields);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Coupon updated',
    data:       { coupon },
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) throw AppError.badRequest('Invalid coupon ID', 'INVALID_ID');

  await couponService.deleteCoupon(id);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Coupon deleted',
    data:       null,
  });
});

module.exports = { listCoupons, createCoupon, updateCoupon, deleteCoupon };
