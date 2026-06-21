'use strict';

const receiptRepository             = require('../repositories/receiptRepository');
const paymentRepository             = require('../repositories/paymentRepository');
const orderRepository               = require('../repositories/orderRepository');
const userRepository                = require('../repositories/userRepository');
const { buildReceiptPDF }           = require('./pdfService');
const { saveFile, resolveFilePath, fileExists } = require('../utils/storageService');
const { generateReceiptNumber }     = require('../utils/documentNumberGenerator');
const { AppError }                  = require('../utils/AppError');
const { logger }                    = require('../utils/logger');
const { GATEWAY_STATUS }            = require('../constants/paymentStatus');

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Fetches payment + order, enforces ownership.
 * Pass requestingUserId = null to skip ownership check (internal/admin calls).
 */
async function resolvePaymentAndOrder(paymentId, requestingUserId) {
  const payment = await paymentRepository.findById(paymentId);
  if (!payment) throw AppError.notFound('Payment not found', 'PAYMENT_NOT_FOUND');

  const order = await orderRepository.findById(payment.order_id);
  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  if (requestingUserId !== null && String(order.user_id) !== String(requestingUserId)) {
    throw AppError.forbidden('Access denied', 'ACCESS_DENIED');
  }

  return { payment, order };
}

/**
 * Generates the receipt PDF buffer and persists it to storage.
 * Updates receipt_path in the database.
 */
async function generatePDF(receipt, payment, order) {
  const user = await userRepository.findById(order.user_id);

  const buffer    = await buildReceiptPDF({ receipt, payment, order, user });
  const filename  = `receipt-${receipt.receipt_number}.pdf`;
  const savedPath = saveFile('receipts', filename, buffer);

  const updated = await receiptRepository.updatePath(receipt.id, savedPath);

  logger.info('[ReceiptService] PDF saved', {
    receiptId: receipt.id,
    path:      savedPath,
  });

  return updated;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generates or retrieves a receipt for a verified payment.
 * Idempotent — re-generates PDF only if the file is missing from disk.
 *
 * Business rules:
 *   - Payment must have payment_status = 'verified'
 *   - Users can only access their own receipts
 *   - One receipt per payment (enforced at DB level)
 *
 * @param {number}             paymentId
 * @param {number|string|null} requestingUserId  null = internal / admin
 * @returns {{ receipt: object, download_url: string }}
 */
async function generateReceipt(paymentId, requestingUserId = null) {
  const { payment, order } = await resolvePaymentAndOrder(paymentId, requestingUserId);

  if (payment.payment_status !== GATEWAY_STATUS.VERIFIED) {
    throw AppError.badRequest(
      'Receipt is only available for verified payments',
      'RECEIPT_NOT_AVAILABLE'
    );
  }

  // Find or create the receipt record
  let receipt = await receiptRepository.findByPaymentId(paymentId);
  if (!receipt) {
    receipt = await receiptRepository.create({
      paymentId,
      receiptNumber: generateReceiptNumber(),
    });
    logger.info('[ReceiptService] Receipt record created', {
      receiptId:     receipt.id,
      receiptNumber: receipt.receipt_number,
    });
  }

  // Generate PDF if file is absent
  if (!fileExists(receipt.receipt_path)) {
    receipt = await generatePDF(receipt, payment, order);
  }

  return {
    receipt,
    download_url: `/api/receipt/download/${paymentId}`,
  };
}

/**
 * Returns receipt metadata without triggering PDF generation.
 */
async function getReceipt(paymentId, requestingUserId = null) {
  const { payment, order } = await resolvePaymentAndOrder(paymentId, requestingUserId);

  const receipt = await receiptRepository.findByPaymentId(paymentId);
  if (!receipt) {
    throw AppError.notFound('Receipt not found for this payment', 'RECEIPT_NOT_FOUND');
  }

  return {
    receipt,
    payment,
    order,
    download_url: `/api/receipt/download/${paymentId}`,
    has_file:     fileExists(receipt.receipt_path),
  };
}

/**
 * Returns the absolute filesystem path of the receipt PDF.
 * Triggers generation / regeneration if the file is missing.
 */
async function getReceiptFilePath(paymentId, requestingUserId = null) {
  const { receipt } = await generateReceipt(paymentId, requestingUserId);

  if (!receipt.receipt_path) {
    throw AppError.internal('Receipt file could not be generated', 'RECEIPT_FILE_ERROR');
  }

  return resolveFilePath(receipt.receipt_path);
}

module.exports = { generateReceipt, getReceipt, getReceiptFilePath };
