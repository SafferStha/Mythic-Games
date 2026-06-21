'use strict';

/**
 * Payment and order lifecycle status constants.
 * Mirrored in DB CHECK constraints — keep in sync.
 */

const PAYMENT_STATUS = Object.freeze({
  PENDING:   'pending',
  PAID:      'paid',
  FAILED:    'failed',
  REFUNDED:  'refunded',
});

const ORDER_STATUS = Object.freeze({
  PROCESSING: 'processing',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
});

module.exports = { PAYMENT_STATUS, ORDER_STATUS };
