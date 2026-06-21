'use strict';

const esewaService = require('../services/esewaService');
const {
  validateInitiatePayment,
  validateVerifyPayment,
  extractCallbackData,
} = require('../validators/paymentValidator');
const { asyncHandler }          = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const { HTTP_STATUS }            = require('../constants/httpStatus');

/**
 * POST /api/payment/esewa/initiate
 *
 * Validates order ownership and status, creates a payment record,
 * and returns the signed eSewa form payload for the frontend to submit.
 *
 * Response:
 * {
 *   success: true,
 *   message: "Payment initiated",
 *   data: { payment, esewa_payload, payment_url }
 * }
 */
const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const { orderId } = validateInitiatePayment(req.body);

  const result = await esewaService.initiatePayment(orderId, req.user.uid);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Payment initiated',
    data: {
      payment:       result.payment,
      esewa_payload: result.esewa_payload,
      payment_url:   result.payment_url,
    },
  });
});

/**
 * GET /api/payment/esewa/success
 *
 * eSewa redirects the user here after a successful payment.
 * This endpoint is PUBLIC — no JWT is present on a gateway redirect.
 *
 * Security is enforced inside the service:
 *   - HMAC-SHA256 callback signature verification
 *   - Amount validation against stored order
 *   - Independent eSewa verification API call (authoritative)
 *   - Idempotency guard (duplicate callbacks are safe)
 *
 * Response:
 * {
 *   success: true,
 *   message: "Payment successful",
 *   data: { order, invoice, receipt }
 * }
 */
const handleEsewaSuccess = asyncHandler(async (req, res) => {
  const encodedData = extractCallbackData(req.query);

  const result = await esewaService.handleSuccess(encodedData);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Payment successful',
    data: {
      order:   result.order,
      invoice: result.invoice,
      receipt: result.receipt,
    },
  });
});

/**
 * GET /api/payment/esewa/failure
 *
 * eSewa redirects the user here when payment is cancelled or fails.
 * This endpoint is PUBLIC — no JWT is present on a gateway redirect.
 *
 * Marks the payment as failed and keeps the order in 'pending' state
 * so the user can retry payment.
 *
 * Response:
 * {
 *   success: false,
 *   message: "Payment failed"
 * }
 */
const handleEsewaFailure = asyncHandler(async (req, res) => {
  const encodedData = extractCallbackData(req.query);

  await esewaService.handleFailure(encodedData);

  return sendError(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Payment failed',
  });
});

/**
 * POST /api/payment/esewa/verify
 *
 * Manually verifies a payment by transaction UUID.
 * Used when the success callback fails to deliver or for support reconciliation.
 *
 * Enforces ownership — users can only verify their own payments.
 *
 * Response includes already_verified flag plus payment, order, invoice, receipt.
 */
const verifyEsewaPayment = asyncHandler(async (req, res) => {
  const { transactionUuid } = validateVerifyPayment(req.body);

  const result = await esewaService.verifyPayment(transactionUuid, req.user.uid);

  const message = result.already_verified
    ? 'Payment already verified'
    : result.invoice
      ? 'Payment verified successfully'
      : `Payment status: ${result.verification_status ?? 'unknown'}`;

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message,
    data: result,
  });
});

module.exports = {
  initiateEsewaPayment,
  handleEsewaSuccess,
  handleEsewaFailure,
  verifyEsewaPayment,
};
