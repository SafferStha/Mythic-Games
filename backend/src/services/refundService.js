'use strict';

const refundRepository       = require('../repositories/refundRepository');
const orderRepository        = require('../repositories/orderRepository');
const notificationService    = require('./notificationService');
const { AppError }           = require('../utils/AppError');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../constants/orderStatus');

const REFUND_WINDOW_DAYS = parseInt(process.env.REFUND_WINDOW_DAYS ?? '14', 10);

async function requestRefund(userId, orderId, reason) {
  const order = await orderRepository.findById(orderId);

  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  if (String(order.user_id) !== String(userId)) {
    throw AppError.forbidden('Access denied', 'ORDER_ACCESS_DENIED');
  }

  if (order.payment_status !== PAYMENT_STATUS.PAID) {
    throw AppError.badRequest(
      'Only paid orders can be refunded',
      'ORDER_NOT_PAID'
    );
  }

  if (order.order_status !== ORDER_STATUS.COMPLETED) {
    throw AppError.badRequest(
      'Only completed orders can be refunded',
      'ORDER_NOT_COMPLETED'
    );
  }

  // Refund window check
  const purchaseDate = new Date(order.created_at);
  const windowEnd    = new Date(purchaseDate);
  windowEnd.setDate(windowEnd.getDate() + REFUND_WINDOW_DAYS);

  if (new Date() > windowEnd) {
    throw AppError.badRequest(
      `Refund window of ${REFUND_WINDOW_DAYS} days has passed`,
      'REFUND_WINDOW_EXPIRED'
    );
  }

  // Duplicate check
  const existing = await refundRepository.findByOrderId(orderId);
  if (existing) {
    throw AppError.conflict('A refund request already exists for this order', 'REFUND_ALREADY_EXISTS');
  }

  const refund = await refundRepository.create({ orderId, userId, reason });
  return refund;
}

async function getUserRefunds(userId, { page, limit } = {}) {
  return refundRepository.findByUserId(userId, { page, limit });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

async function listRefunds({ page, limit, status } = {}) {
  return refundRepository.findAll({ page, limit, status });
}

async function processRefund(refundId, { status, adminNotes }) {
  const refund = await refundRepository.findById(refundId);
  if (!refund) throw AppError.notFound('Refund not found', 'REFUND_NOT_FOUND');

  const validTransitions = {
    pending:   ['approved', 'rejected'],
    approved:  ['processed', 'rejected'],
    rejected:  [],
    processed: [],
  };

  if (!validTransitions[refund.status]?.includes(status)) {
    throw AppError.badRequest(
      `Cannot transition refund from "${refund.status}" to "${status}"`,
      'INVALID_REFUND_TRANSITION'
    );
  }

  const updated = await refundRepository.updateStatus(refundId, { status, adminNotes });

  // If approved → mark order as refunded
  if (status === 'processed') {
    await orderRepository.updatePaymentStatus(refund.order_id, PAYMENT_STATUS.REFUNDED);
  }

  // Send notification to user
  try {
    await notificationService.notifyRefundUpdate(refund.user_id, updated, status);
  } catch (_) {
    // Non-fatal
  }

  return updated;
}

module.exports = {
  requestRefund,
  getUserRefunds,
  listRefunds,
  processRefund,
};
