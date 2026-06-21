'use strict';

const https = require('https');

const env               = require('../config/env');
const paymentRepository = require('../repositories/paymentRepository');
const orderRepository   = require('../repositories/orderRepository');
const paymentService    = require('./paymentService');
const { AppError }      = require('../utils/AppError');
const { logger }        = require('../utils/logger');
const { round }         = require('../utils/cartCalculator');
const { GATEWAY_STATUS, PAYMENT_PROVIDERS } = require('../constants/paymentStatus');
const { PAYMENT_STATUS, ORDER_STATUS }       = require('../constants/orderStatus');
const {
  generateSignature,
  verifyCallbackSignature,
  decodeCallbackData,
} = require('../utils/esewaSignature');

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Makes an HTTPS GET request and parses the JSON response.
 * Uses Node's built-in `https` to avoid external dependencies.
 *
 * @param {string} url
 * @returns {Promise<object>}
 */
function httpsGetJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error(`eSewa returned non-JSON: ${body.slice(0, 200)}`));
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * Calls eSewa's transaction status verification endpoint.
 * This is the authoritative source of truth — never skip this step.
 *
 * @param {{ totalAmount: string, transactionUuid: string, productCode: string }}
 * @returns {Promise<object>}  eSewa verification response
 */
async function callEsewaVerificationApi({ totalAmount, transactionUuid, productCode }) {
  const params = new URLSearchParams({
    product_code:     productCode,
    transaction_uuid: transactionUuid,
    total_amount:     totalAmount,
  });

  const url = `${env.ESEWA_VERIFICATION_URL}?${params.toString()}`;
  logger.debug(`[eSewa] Verification request: ${url}`);

  try {
    const response = await httpsGetJSON(url);
    logger.debug(`[eSewa] Verification response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    logger.error('[eSewa] Verification API unreachable', { error: error.message });
    throw AppError.internal(
      'Unable to verify payment with eSewa. Please try again.',
      'ESEWA_VERIFICATION_UNAVAILABLE'
    );
  }
}

// ── Public service methods ────────────────────────────────────────────────────

/**
 * Initiates an eSewa payment for an existing order.
 *
 * Validates:
 *   - Order exists and belongs to the requesting user
 *   - Order payment_status is 'pending' or 'failed' (retry allowed)
 *   - Order is not cancelled
 *
 * Creates a payment record (new UUID per attempt) and builds the
 * signed eSewa form payload that the frontend will submit.
 *
 * @param {number} orderId
 * @param {number|string} userId
 * @returns {{ payment, esewa_payload, payment_url }}
 */
async function initiatePayment(orderId, userId) {
  // ── Validate order ────────────────────────────────────────────────────────
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  }

  if (String(order.user_id) !== String(userId)) {
    throw AppError.forbidden(
      'You do not have permission to pay this order',
      'ORDER_ACCESS_DENIED'
    );
  }

  if (order.payment_status === PAYMENT_STATUS.PAID) {
    throw AppError.conflict('This order has already been paid', 'ORDER_ALREADY_PAID');
  }

  if (order.order_status === ORDER_STATUS.CANCELLED) {
    throw AppError.badRequest('Cannot pay a cancelled order', 'ORDER_CANCELLED');
  }

  // ── Create payment initiation record ─────────────────────────────────────
  const amount  = round(parseFloat(order.grand_total));
  const payment = await paymentService.createPaymentRecord({
    orderId,
    amount,
    provider: PAYMENT_PROVIDERS.ESEWA,
  });

  // ── Build signed eSewa payload ────────────────────────────────────────────
  const totalAmountStr = amount.toFixed(2);
  const productCode    = env.ESEWA_MERCHANT_CODE;

  const signature = generateSignature({
    totalAmount:     totalAmountStr,
    transactionUuid: payment.transaction_uuid,
    productCode,
    secretKey:       env.ESEWA_SECRET_KEY,
  });

  const esewaPayload = {
    amount:                   totalAmountStr,
    tax_amount:               '0',
    total_amount:             totalAmountStr,
    transaction_uuid:         payment.transaction_uuid,
    product_code:             productCode,
    product_service_charge:   '0',
    product_delivery_charge:  '0',
    success_url:              env.ESEWA_SUCCESS_URL,
    failure_url:              env.ESEWA_FAILURE_URL,
    signed_field_names:       'total_amount,transaction_uuid,product_code',
    signature,
  };

  logger.info('[eSewa] Payment initiated', {
    orderId,
    transactionUuid: payment.transaction_uuid,
    amount: totalAmountStr,
  });

  return {
    payment,
    esewa_payload: esewaPayload,
    payment_url:   env.ESEWA_PAYMENT_URL,
  };
}

/**
 * Processes the eSewa success callback (GET redirect from eSewa).
 *
 * Security layers:
 *   1. Decode and parse Base64 callback data
 *   2. Verify HMAC-SHA256 callback signature
 *   3. Validate amount against order record
 *   4. Call eSewa verification API independently
 *   5. Idempotency — skip if already verified
 *
 * @param {string|null} encodedData  Raw ?data= query param value
 * @returns {{ payment, order, invoice, receipt }}
 */
async function handleSuccess(encodedData) {
  // ── 1. Decode callback ────────────────────────────────────────────────────
  const callbackData = decodeCallbackData(encodedData);

  if (!callbackData) {
    throw AppError.badRequest('Invalid or missing callback data', 'INVALID_CALLBACK_DATA');
  }

  // ── 2. Verify callback signature ──────────────────────────────────────────
  const signatureValid = verifyCallbackSignature(callbackData, env.ESEWA_SECRET_KEY);

  if (!signatureValid) {
    logger.warn('[eSewa] Callback signature verification FAILED', {
      transaction_uuid: callbackData.transaction_uuid,
    });
    throw AppError.badRequest(
      'Callback signature verification failed',
      'INVALID_CALLBACK_SIGNATURE'
    );
  }

  const { transaction_uuid, total_amount } = callbackData;

  // ── 3. Find payment record ────────────────────────────────────────────────
  const payment = await paymentRepository.findByTransactionUuid(transaction_uuid);

  if (!payment) {
    throw AppError.notFound(
      'Payment record not found for this transaction',
      'PAYMENT_NOT_FOUND'
    );
  }

  // ── 4. Idempotency: already verified → return existing documents ──────────
  if (payment.payment_status === GATEWAY_STATUS.VERIFIED) {
    logger.info('[eSewa] Duplicate success callback received', {
      transaction_uuid,
      paymentId: payment.id,
    });
    const details = await paymentService.getPaymentDetails(payment.id);
    const order   = await orderRepository.findById(payment.order_id);
    return {
      payment: details.payment,
      order,
      invoice: details.invoice,
      receipt: details.receipt,
    };
  }

  // ── 5. Validate amount matches order ──────────────────────────────────────
  const order          = await orderRepository.findById(payment.order_id);
  const expectedAmount = round(parseFloat(order.grand_total));
  const receivedAmount = round(parseFloat(total_amount));

  if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
    logger.error('[eSewa] Amount mismatch detected — possible tampering', {
      expected: expectedAmount,
      received: receivedAmount,
      transaction_uuid,
    });

    await paymentService.markPaymentFailed({
      paymentId:       payment.id,
      orderId:         payment.order_id,
      failureReason:   `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
      gatewayResponse: callbackData,
    });

    throw AppError.badRequest(
      'Payment amount does not match the order total',
      'AMOUNT_MISMATCH'
    );
  }

  // ── 6. Verify with eSewa API (authoritative confirmation) ─────────────────
  const verificationResponse = await callEsewaVerificationApi({
    totalAmount:     receivedAmount.toFixed(2),
    transactionUuid: transaction_uuid,
    productCode:     env.ESEWA_MERCHANT_CODE,
  });

  if (verificationResponse.status !== 'COMPLETE') {
    logger.warn('[eSewa] Verification status is not COMPLETE', {
      status:          verificationResponse.status,
      transaction_uuid,
    });

    await paymentService.markPaymentFailed({
      paymentId:       payment.id,
      orderId:         payment.order_id,
      failureReason:   `eSewa verification status: ${verificationResponse.status}`,
      gatewayResponse: verificationResponse,
    });

    throw AppError.badRequest(
      `Payment verification failed (status: ${verificationResponse.status})`,
      'PAYMENT_VERIFICATION_FAILED'
    );
  }

  // ── 7. Mark payment and order as complete ─────────────────────────────────
  const result = await paymentService.markPaymentVerified({
    paymentId:        payment.id,
    orderId:          payment.order_id,
    paymentReference: verificationResponse.ref_id ?? callbackData.transaction_code ?? null,
    gatewayResponse:  verificationResponse,
  });

  logger.info('[eSewa] Payment verified and order completed', {
    orderId:         payment.order_id,
    transaction_uuid,
    refId:           verificationResponse.ref_id,
  });

  return result;
}

/**
 * Processes the eSewa failure callback (GET redirect from eSewa).
 *
 * Marks the payment as failed and allows retry.
 * Gracefully handles minimal or missing callback data.
 *
 * @param {string|null} encodedData  Raw ?data= query param value
 * @returns {{ payment: object|null, order: object|null, orderId: number|null }}
 */
async function handleFailure(encodedData) {
  const callbackData    = decodeCallbackData(encodedData) ?? {};
  const { transaction_uuid } = callbackData;

  if (!transaction_uuid) {
    logger.warn('[eSewa] Failure callback received with no transaction_uuid');
    return { payment: null, order: null, orderId: null };
  }

  const payment = await paymentRepository.findByTransactionUuid(transaction_uuid);

  if (!payment) {
    logger.warn('[eSewa] Failure callback: payment record not found', { transaction_uuid });
    return { payment: null, order: null, orderId: null };
  }

  // Only update if still in initiated state (idempotency guard)
  if (payment.payment_status === GATEWAY_STATUS.INITIATED) {
    const result = await paymentService.markPaymentFailed({
      paymentId:       payment.id,
      orderId:         payment.order_id,
      failureReason:   'Payment cancelled or failed at eSewa gateway',
      gatewayResponse: callbackData,
    });

    logger.info('[eSewa] Payment marked as failed', {
      orderId:         payment.order_id,
      transaction_uuid,
    });

    return { ...result, orderId: payment.order_id };
  }

  const order = await orderRepository.findById(payment.order_id);
  return { payment, order, orderId: payment.order_id };
}

/**
 * Manually verifies a payment by transaction UUID.
 * Used when the callback fails to deliver or for customer support reconciliation.
 *
 * @param {string} transactionUuid
 * @param {number|string} userId  Enforces ownership
 */
async function verifyPayment(transactionUuid, userId) {
  const payment = await paymentRepository.findByTransactionUuid(transactionUuid);

  if (!payment) {
    throw AppError.notFound('Payment not found', 'PAYMENT_NOT_FOUND');
  }

  const order = await orderRepository.findById(payment.order_id);
  if (!order) {
    throw AppError.notFound('Order not found', 'ORDER_NOT_FOUND');
  }

  if (String(order.user_id) !== String(userId)) {
    throw AppError.forbidden('Access denied', 'ACCESS_DENIED');
  }

  // If already verified, return existing data without calling eSewa
  if (payment.payment_status === GATEWAY_STATUS.VERIFIED) {
    const details = await paymentService.getPaymentDetails(payment.id);
    return {
      already_verified: true,
      payment:  details.payment,
      order,
      invoice:  details.invoice,
      receipt:  details.receipt,
    };
  }

  // Call eSewa verification API
  const verificationResponse = await callEsewaVerificationApi({
    totalAmount:     round(parseFloat(order.grand_total)).toFixed(2),
    transactionUuid,
    productCode:     env.ESEWA_MERCHANT_CODE,
  });

  if (verificationResponse.status === 'COMPLETE') {
    const result = await paymentService.markPaymentVerified({
      paymentId:        payment.id,
      orderId:          payment.order_id,
      paymentReference: verificationResponse.ref_id ?? null,
      gatewayResponse:  verificationResponse,
    });

    return { already_verified: false, ...result };
  }

  // Not complete — update payment status if still pending
  if (payment.payment_status === GATEWAY_STATUS.INITIATED) {
    await paymentService.markPaymentFailed({
      paymentId:       payment.id,
      orderId:         payment.order_id,
      failureReason:   `eSewa status: ${verificationResponse.status}`,
      gatewayResponse: verificationResponse,
    });
  }

  const updatedPayment = await paymentRepository.findById(payment.id);
  const updatedOrder   = await orderRepository.findById(payment.order_id);

  return {
    already_verified:    false,
    payment:             updatedPayment,
    order:               updatedOrder,
    verification_status: verificationResponse.status,
  };
}

module.exports = {
  initiatePayment,
  handleSuccess,
  handleFailure,
  verifyPayment,
};
