'use strict';

const orderRepository    = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const adminLogRepository = require('../repositories/adminLogRepository');
const { AppError }       = require('../utils/AppError');

const VALID_ORDER_STATUSES   = ['processing', 'completed', 'cancelled', 'refunded'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

async function getAllOrders({ page, limit, orderStatus, paymentStatus, search } = {}) {
  return orderRepository.findAllAdmin({ page, limit, orderStatus, paymentStatus, search });
}

async function getOrderById(id) {
  const order = await orderRepository.findById(id);
  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  const items = await orderItemRepository.findByOrderId(id);
  return { ...order, items };
}

async function updateOrderStatus(id, { orderStatus, paymentStatus }, adminCtx) {
  const order = await orderRepository.findById(id);
  if (!order) throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');

  if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
    throw AppError.badRequest(`Invalid order status: ${orderStatus}`, 'INVALID_STATUS');
  }

  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    throw AppError.badRequest(`Invalid payment status: ${paymentStatus}`, 'INVALID_STATUS');
  }

  const updated = await orderRepository.updateStatuses(id, {
    paymentStatus: paymentStatus ?? order.payment_status,
    orderStatus:   orderStatus   ?? order.order_status,
  });

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'UPDATE_ORDER_STATUS',
    entity:    'order',
    entityId:  id,
    detail:    { orderStatus, paymentStatus },
    ipAddress: adminCtx.ip,
  });

  return updated;
}

module.exports = { getAllOrders, getOrderById, updateOrderStatus };
