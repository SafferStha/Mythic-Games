'use strict';

const refundService    = require('../services/refundService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');
const { AppError }     = require('../utils/AppError');

const requestRefund = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.body.order_id, 10);
  if (!orderId || isNaN(orderId)) throw AppError.badRequest('order_id is required', 'INVALID_ORDER_ID');

  const reason = req.body.reason?.trim();
  if (!reason || reason.length < 10) {
    throw AppError.badRequest('Please provide a reason (at least 10 characters)', 'REASON_TOO_SHORT');
  }

  const refund = await refundService.requestRefund(req.user.uid, orderId, reason);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message:    'Refund request submitted',
    data:       { refund },
  });
});

const getMyRefunds = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  ?? '1',  10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20', 10)));

  const result = await refundService.getUserRefunds(req.user.uid, { page, limit });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Refunds retrieved',
    data:       result,
  });
});

module.exports = { requestRefund, getMyRefunds };
