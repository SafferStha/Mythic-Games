'use strict';

const orderRepository     = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const { AppError }        = require('../utils/AppError');

/**
 * Fetches a single order with its items.
 *
 * Enforces strict ownership: users can only view their own orders.
 * Admins are not handled here — a separate admin endpoint would use
 * orderRepository.findById directly without the ownership check.
 *
 * @param {number} orderId
 * @param {number|string} userId  The authenticated user's UID
 * @returns {{ order: object, items: object[] }}
 */
async function getOrderById(orderId, userId) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  }

  // Use string comparison to safely handle BIGINT from PostgreSQL
  if (String(order.user_id) !== String(userId)) {
    throw AppError.forbidden(
      'You do not have permission to view this order',
      'ORDER_ACCESS_DENIED'
    );
  }

  const items = await orderItemRepository.findByOrderId(orderId);

  return { order, items };
}

/**
 * Returns all orders for the authenticated user, newest first.
 * Supports optional filtering by status fields.
 *
 * @param {number|string} userId
 * @param {{ paymentStatus?: string, orderStatus?: string }} filters
 * @returns {object[]}
 */
async function getUserOrders(userId, filters = {}) {
  return orderRepository.findByUserId(userId, filters);
}

module.exports = { getOrderById, getUserOrders };
