'use strict';

const checkoutService          = require('../services/checkoutService');
const { validateCheckoutBody } = require('../validators/checkoutValidator');
const { asyncHandler }         = require('../utils/asyncHandler');
const { sendSuccess }          = require('../utils/responseFormatter');
const { HTTP_STATUS }          = require('../constants/httpStatus');

/**
 * POST /api/checkout
 *
 * Converts the authenticated user's active cart into a pending order.
 *
 * The response includes `payment_pending: true` as a signal to the frontend
 * that the next step is payment initiation (Phase 5 — eSewa integration).
 *
 * Response shape:
 * {
 *   order:           { id, order_number, subtotal, tax, discount, grand_total,
 *                      payment_status, order_status, created_at, ... }
 *   items:           [ { id, game_id, quantity, price, subtotal, game_title } ]
 *   summary:         { itemCount, subtotal, discount, taxRate, tax, grandTotal }
 *   payment_pending: true
 * }
 */
const checkout = asyncHandler(async (req, res) => {
  const { notes } = validateCheckoutBody(req.body);
  const result    = await checkoutService.processCheckout(req.user.uid, { notes });

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message:    'Order created successfully',
    data: {
      order:           result.order,
      items:           result.items,
      summary:         result.summary,
      payment_pending: true,
    },
  });
});

module.exports = { checkout };
