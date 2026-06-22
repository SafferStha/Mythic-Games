'use strict';

const adminInvoiceService = require('../../services/adminInvoiceService');
const { asyncHandler }    = require('../../utils/asyncHandler');
const { sendSuccess }     = require('../../utils/responseFormatter');

const listInvoices = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await adminInvoiceService.getAllInvoices({
    page:  parseInt(page)  || 1,
    limit: parseInt(limit) || 20,
  });
  return sendSuccess(res, { data: result });
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await adminInvoiceService.getInvoiceById(req.params.id);
  return sendSuccess(res, { data: invoice });
});

const regenerateInvoice = asyncHandler(async (req, res) => {
  const result = await adminInvoiceService.regenerateInvoice(req.params.orderId);
  return sendSuccess(res, { data: result, message: 'Invoice regenerated successfully' });
});

module.exports = { listInvoices, getInvoice, regenerateInvoice };
