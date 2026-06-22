'use strict';

const adminPaymentService = require('../../services/adminPaymentService');
const { asyncHandler }    = require('../../utils/asyncHandler');
const { sendSuccess }     = require('../../utils/responseFormatter');

const adminCtx = (req) => ({
  adminId:   req.user.uid ?? req.user.admin_id,
  adminRole: req.user.role,
  ip:        req.ip,
});

const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await adminPaymentService.getAllPayments({
    page:   parseInt(page)  || 1,
    limit:  parseInt(limit) || 20,
    status: status          || null,
  });
  return sendSuccess(res, { data: result });
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await adminPaymentService.getPaymentById(req.params.id);
  return sendSuccess(res, { data: payment });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await adminPaymentService.manuallyVerifyPayment(req.params.id, adminCtx(req));
  return sendSuccess(res, { data: payment, message: 'Payment verified successfully' });
});

module.exports = { listPayments, getPayment, verifyPayment };
