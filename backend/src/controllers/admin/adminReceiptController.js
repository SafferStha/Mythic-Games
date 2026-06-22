'use strict';

const adminReceiptService = require('../../services/adminReceiptService');
const { asyncHandler }    = require('../../utils/asyncHandler');
const { sendSuccess }     = require('../../utils/responseFormatter');

const listReceipts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await adminReceiptService.getAllReceipts({
    page:  parseInt(page)  || 1,
    limit: parseInt(limit) || 20,
  });
  return sendSuccess(res, { data: result });
});

const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await adminReceiptService.getReceiptById(req.params.id);
  return sendSuccess(res, { data: receipt });
});

const regenerateReceipt = asyncHandler(async (req, res) => {
  const result = await adminReceiptService.regenerateReceipt(req.params.paymentId);
  return sendSuccess(res, { data: result, message: 'Receipt regenerated successfully' });
});

module.exports = { listReceipts, getReceipt, regenerateReceipt };
