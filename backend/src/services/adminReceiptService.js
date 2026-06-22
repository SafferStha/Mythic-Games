'use strict';

const receiptRepository  = require('../repositories/receiptRepository');
const receiptService     = require('./receiptService');
const { AppError }       = require('../utils/AppError');

async function getAllReceipts({ page, limit } = {}) {
  return receiptRepository.findAllAdmin({ page, limit });
}

async function getReceiptById(id) {
  const receipt = await receiptRepository.findById(id);
  if (!receipt) throw AppError.notFound('Receipt not found', 'RECEIPT_NOT_FOUND');
  return receipt;
}

// Delegates to existing receiptService which handles PDF generation
async function regenerateReceipt(paymentId) {
  return receiptService.generateReceipt(paymentId, null);
}

module.exports = { getAllReceipts, getReceiptById, regenerateReceipt };
