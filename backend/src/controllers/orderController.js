'use strict';

const orderService        = require('../services/orderService');
const { validateOrderId } = require('../validators/checkoutValidator');
const { asyncHandler }    = require('../utils/asyncHandler');
const { sendSuccess }     = require('../utils/responseFormatter');
const { HTTP_STATUS }     = require('../constants/httpStatus');

/**
 * GET /api/orders
 *
 * Returns the complete order history for the authenticated user.
 * Supports optional query-string filters:
 *   ?paymentStatus=pending|paid|failed|refunded
 *   ?orderStatus=processing|completed|cancelled
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const filters = {
    paymentStatus: req.query.paymentStatus || null,
    orderStatus:   req.query.orderStatus   || null,
  };

  const orders = await orderService.getUserOrders(req.user.uid, filters);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Orders retrieved successfully',
    data:       { orders },
  });
});

/**
 * GET /api/orders/:orderId
 *
 * Returns a single order with its items.
 * Ownership is enforced — users can only access their own orders.
 */
const getOrder = asyncHandler(async (req, res) => {
  const orderId = validateOrderId(req.params);
  const result  = await orderService.getOrderById(orderId, req.user.uid);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Order retrieved successfully',
    data:       result,
  });
});

module.exports = { getMyOrders, getOrder };
