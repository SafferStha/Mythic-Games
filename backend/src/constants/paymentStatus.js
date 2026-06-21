'use strict';

/**
 * Payment gateway lifecycle status constants.
 * Distinct from order-level payment_status — these track the gateway attempt.
 * Mirrored in payments.payment_status DB CHECK constraint.
 */
const GATEWAY_STATUS = Object.freeze({
  INITIATED: 'initiated',
  VERIFIED:  'verified',
  FAILED:    'failed',
});

const PAYMENT_PROVIDERS = Object.freeze({
  ESEWA:  'esewa',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
});

module.exports = { GATEWAY_STATUS, PAYMENT_PROVIDERS };
