'use strict';

const invoiceRepository  = require('../repositories/invoiceRepository');
const invoiceService     = require('./invoiceService');
const { AppError }       = require('../utils/AppError');

async function getAllInvoices({ page, limit } = {}) {
  return invoiceRepository.findAllAdmin({ page, limit });
}

async function getInvoiceById(id) {
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) throw AppError.notFound('Invoice not found', 'INVOICE_NOT_FOUND');
  return invoice;
}

// Delegates to existing invoiceService which handles PDF generation
async function regenerateInvoice(orderId) {
  return invoiceService.generateInvoice(orderId, null);
}

module.exports = { getAllInvoices, getInvoiceById, regenerateInvoice };
