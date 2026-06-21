'use strict';

const path            = require('path');
const invoiceService  = require('../services/invoiceService');
const { AppError }    = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');

function parseOrderId(params) {
  const id = parseInt(params.orderId, 10);
  if (!id || id <= 0) throw AppError.badRequest('Invalid orderId', 'INVALID_PARAM');
  return id;
}

/**
 * GET /api/invoice/:orderId
 *
 * Returns invoice metadata and a download URL.
 * Ownership enforced — users can only access their own invoices.
 *
 * Response:
 * {
 *   success: true,
 *   data: { invoice, order, download_url, has_file }
 * }
 */
const getInvoice = asyncHandler(async (req, res) => {
  const orderId = parseOrderId(req.params);
  const result  = await invoiceService.getInvoice(orderId, req.user.uid);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Invoice retrieved',
    data:       result,
  });
});

/**
 * GET /api/invoice/download/:orderId
 *
 * Streams the invoice PDF to the client as a file download.
 * Triggers PDF generation / regeneration if the file is missing.
 * Ownership enforced.
 */
const downloadInvoice = asyncHandler(async (req, res) => {
  const orderId  = parseOrderId(req.params);
  const filePath = await invoiceService.getInvoiceFilePath(orderId, req.user.uid);
  const filename = path.basename(filePath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'private, no-cache');

  res.sendFile(filePath);
});

module.exports = { getInvoice, downloadInvoice };
