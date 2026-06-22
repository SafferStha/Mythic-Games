'use strict';

const crypto              = require('crypto');
const paymentRepository   = require('../repositories/paymentRepository');
const invoiceRepository   = require('../repositories/invoiceRepository');
const receiptRepository   = require('../repositories/receiptRepository');
const orderRepository     = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const { GATEWAY_STATUS, PAYMENT_PROVIDERS } = require('../constants/paymentStatus');
const { PAYMENT_STATUS, ORDER_STATUS }       = require('../constants/orderStatus');
const { generateInvoiceNumber, generateReceiptNumber } = require('../utils/documentNumberGenerator');
const { logger }          = require('../utils/logger');

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Generates a UUID v4 for a payment transaction.
 * Uses crypto.randomUUID() (Node 14.17+).
 */
function generateTransactionUuid() {
  return crypto.randomUUID();
}

// ── Public service methods ────────────────────────────────────────────────────

/**
 * Creates a new payment initiation record.
 * Called once per payment attempt — each attempt gets its own UUID.
 *
 * @param {{ orderId: number, amount: number, provider?: string }}
 * @returns {object} The created payment row
 */
async function createPaymentRecord({
  orderId,
  amount,
  provider = PAYMENT_PROVIDERS.ESEWA,
}) {
  const transactionUuid = generateTransactionUuid();

  return paymentRepository.create({
    orderId,
    provider,
    transactionUuid,
    amount,
  });
}

/**
 * Creates an invoice record for a completed order.
 * Idempotent — returns existing invoice if one already exists.
 *
 * @param {number} orderId
 * @returns {object}
 */
async function createInvoiceRecord(orderId) {
  const existing = await invoiceRepository.findByOrderId(orderId);
  if (existing) return existing;

  const invoiceNumber = generateInvoiceNumber();
  return invoiceRepository.create({ orderId, invoiceNumber });
}

/**
 * Creates a receipt record for a verified payment.
 * Idempotent — returns existing receipt if one already exists.
 *
 * @param {number} paymentId
 * @returns {object}
 */
async function createReceiptRecord(paymentId) {
  const existing = await receiptRepository.findByPaymentId(paymentId);
  if (existing) return existing;

  const receiptNumber = generateReceiptNumber();
  return receiptRepository.create({ paymentId, receiptNumber });
}

/**
 * Returns a payment record with its associated invoice and receipt.
 *
 * @param {number} paymentId
 * @returns {{ payment, invoice: object|null, receipt: object|null }}
 */
async function getPaymentDetails(paymentId) {
  const payment = await paymentRepository.findById(paymentId);
  if (!payment) return null;

  const [invoice, receipt] = await Promise.all([
    invoiceRepository.findByOrderId(payment.order_id),
    receiptRepository.findByPaymentId(paymentId),
  ]);

  return { payment, invoice: invoice ?? null, receipt: receipt ?? null };
}

/**
 * Marks a payment as verified and transitions the order to paid + completed.
 * Generates invoice and receipt records atomically.
 *
 * This is the single path for a successful payment — all downstream
 * state changes happen here.
 *
 * @param {{
 *   paymentId:        number,
 *   orderId:          number,
 *   paymentReference: string|null,   eSewa transaction code / ref_id
 *   gatewayResponse:  object,        Full raw gateway response (audit)
 * }}
 * @returns {{ payment, order, invoice, receipt }}
 */
async function markPaymentVerified({
  paymentId,
  orderId,
  paymentReference,
  gatewayResponse,
}) {
  // 1. Update payment record to verified
  const payment = await paymentRepository.updateStatus({
    paymentId,
    paymentStatus:    GATEWAY_STATUS.VERIFIED,
    paymentReference: paymentReference ?? null,
    gatewayResponse:  gatewayResponse  ?? null,
    failureReason:    null,
  });

  // 2. Update order → paid + completed (single query)
  await orderRepository.updateStatuses(orderId, {
    paymentStatus: PAYMENT_STATUS.PAID,
    orderStatus:   ORDER_STATUS.COMPLETED,
  });

  // 3. Fetch the updated order
  const order = await orderRepository.findById(orderId);

  // 4. Create invoice and receipt (both idempotent)
  const [invoice, receipt] = await Promise.all([
    createInvoiceRecord(orderId),
    createReceiptRecord(paymentId),
  ]);

  // 5. Ecosystem hooks (non-fatal — payment is already secured)
  setImmediate(async () => {
    try {
      const orderItems = await orderItemRepository.findByOrderId(orderId);

      const [libraryService, notificationService, rewardService] = [
        require('./libraryService'),
        require('./notificationService'),
        require('./rewardService'),
      ];

      await Promise.all([
        libraryService.grantOwnershipForOrder(order.user_id, orderId, orderItems),
        notificationService.notifyPaymentSuccess(order.user_id, order),
        rewardService.earnPoints(order.user_id, orderId, parseFloat(order.grand_total)),
      ]);
    } catch (err) {
      logger.error('[paymentService] Ecosystem hooks failed after payment verified (non-fatal)', {
        error:   err.message,
        orderId,
      });
    }
  });

  return { payment, order, invoice, receipt };
}

/**
 * Marks a payment as failed and updates the order's payment status.
 * Does NOT change order_status — the order stays 'processing' to allow retry.
 *
 * @param {{
 *   paymentId:     number,
 *   orderId:       number,
 *   failureReason: string,
 *   gatewayResponse: object|null,
 * }}
 * @returns {{ payment, order }}
 */
async function markPaymentFailed({
  paymentId,
  orderId,
  failureReason,
  gatewayResponse,
}) {
  const payment = await paymentRepository.updateStatus({
    paymentId,
    paymentStatus:    GATEWAY_STATUS.FAILED,
    paymentReference: null,
    gatewayResponse:  gatewayResponse ?? null,
    failureReason:    failureReason   ?? 'Payment failed',
  });

  // Order payment_status → 'failed'; order_status stays 'processing' (retryable)
  await orderRepository.updatePaymentStatus(orderId, PAYMENT_STATUS.FAILED);

  const order = await orderRepository.findById(orderId);
  return { payment, order };
}

module.exports = {
  generateTransactionUuid,
  createPaymentRecord,
  createInvoiceRecord,
  createReceiptRecord,
  getPaymentDetails,
  markPaymentVerified,
  markPaymentFailed,
};
