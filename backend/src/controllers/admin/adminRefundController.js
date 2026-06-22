'use strict';

const refundService    = require('../../services/refundService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { sendSuccess }  = require('../../utils/responseFormatter');
const { HTTP_STATUS }  = require('../../constants/httpStatus');
const { AppError }     = require('../../utils/AppError');

const listRefunds = asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page ?? '1', 10));
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
  const status = req.query.status ?? undefined;

  const result = await refundService.listRefunds({ page, limit, status });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Refunds retrieved',
    data:       result,
  });
});

const processRefund = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) throw AppError.badRequest('Invalid refund ID', 'INVALID_ID');

  const { status, admin_notes } = req.body;

  if (!['approved', 'rejected', 'processed'].includes(status)) {
    throw AppError.badRequest('status must be approved, rejected, or processed', 'INVALID_STATUS');
  }

  const refund = await refundService.processRefund(id, {
    status,
    adminNotes: admin_notes ?? null,
  });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    `Refund ${status}`,
    data:       { refund },
  });
});

module.exports = { listRefunds, processRefund };
