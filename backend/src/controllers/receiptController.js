'use strict';

const path            = require('path');
const receiptService  = require('../services/receiptService');
const { AppError }    = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');

function parsePaymentId(params) {
  const id = parseInt(params.paymentId, 10);
  if (!id || id <= 0) throw AppError.badRequest('Invalid paymentId', 'INVALID_PARAM');
  return id;
}

/**
 * GET /api/receipt/:paymentId
 *
 * Returns receipt metadata and a download URL.
 * Ownership enforced — users can only access their own receipts.
 *
 * Response:
 * {
 *   success: true,
 *   data: { receipt, payment, order, download_url, has_file }
 * }
 */
const getReceipt = asyncHandler(async (req, res) => {
  const paymentId = parsePaymentId(req.params);
  const result    = await receiptService.getReceipt(paymentId, req.user.uid);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Receipt retrieved',
    data:       result,
  });
});

/**
 * GET /api/receipt/download/:paymentId
 *
 * Streams the receipt PDF to the client as a file download.
 * Triggers PDF generation / regeneration if the file is missing.
 * Ownership enforced.
 */
const downloadReceipt = asyncHandler(async (req, res) => {
  const paymentId = parsePaymentId(req.params);
  const filePath  = await receiptService.getReceiptFilePath(paymentId, req.user.uid);
  const filename  = path.basename(filePath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'private, no-cache');

  res.sendFile(filePath);
});

module.exports = { getReceipt, downloadReceipt };
