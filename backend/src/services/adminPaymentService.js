'use strict';

const paymentRepository  = require('../repositories/paymentRepository');
const orderRepository    = require('../repositories/orderRepository');
const adminLogRepository = require('../repositories/adminLogRepository');
const { AppError }       = require('../utils/AppError');

async function getAllPayments({ page, limit, status } = {}) {
  return paymentRepository.findAllAdmin({ page, limit, status });
}

async function getPaymentById(id) {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw AppError.notFound('Payment not found', 'PAYMENT_NOT_FOUND');
  return payment;
}

async function manuallyVerifyPayment(id, adminCtx) {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw AppError.notFound('Payment not found', 'PAYMENT_NOT_FOUND');

  if (payment.payment_status === 'verified') {
    throw AppError.conflict('Payment is already verified', 'PAYMENT_ALREADY_VERIFIED');
  }

  const updated = await paymentRepository.updateStatus({
    paymentId:     id,
    paymentStatus: 'verified',
    paymentReference: payment.payment_reference,
    gatewayResponse:  payment.gateway_response,
    failureReason:    null,
  });

  // Sync order payment status
  await orderRepository.updatePaymentStatus(payment.order_id, 'paid');

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'VERIFY_PAYMENT',
    entity:    'payment',
    entityId:  id,
    detail:    { transactionUuid: payment.transaction_uuid },
    ipAddress: adminCtx.ip,
  });

  return updated;
}

module.exports = { getAllPayments, getPaymentById, manuallyVerifyPayment };
