'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `payments` table.
 */

async function findById(paymentId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM payments WHERE id = $1',
    [paymentId]
  );
  return rows[0] ?? null;
}

async function findByOrderId(orderId, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM payments
      WHERE order_id = $1
      ORDER BY created_at DESC`,
    [orderId]
  );
  return rows;
}

async function findByTransactionUuid(transactionUuid, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM payments WHERE transaction_uuid = $1',
    [transactionUuid]
  );
  return rows[0] ?? null;
}

/**
 * Creates a payment initiation record.
 * Called before redirecting the user to the payment gateway.
 */
async function create({
  orderId, provider, transactionUuid, amount,
}, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO payments (order_id, provider, transaction_uuid, amount)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orderId, provider, transactionUuid, amount]
  );
  return rows[0];
}

/**
 * Records the gateway verification result.
 * Stores the full raw response for audit purposes.
 */
async function recordVerification({
  paymentId, paymentStatus, paymentReference, gatewayResponse,
}, db = pool) {
  const { rows } = await db.query(
    `UPDATE payments
        SET payment_status    = $1,
            payment_reference = $2,
            gateway_response  = $3,
            updated_at        = NOW()
      WHERE id = $4
     RETURNING *`,
    [paymentStatus, paymentReference ?? null, gatewayResponse ?? null, paymentId]
  );
  return rows[0] ?? null;
}

/**
 * Marks a payment as failed with an optional reason.
 */
async function recordFailure(paymentId, failureReason, db = pool) {
  const { rows } = await db.query(
    `UPDATE payments
        SET payment_status = 'failed',
            failure_reason = $1,
            updated_at     = NOW()
      WHERE id = $2
     RETURNING *`,
    [failureReason ?? null, paymentId]
  );
  return rows[0] ?? null;
}

module.exports = {
  findById,
  findByOrderId,
  findByTransactionUuid,
  create,
  recordVerification,
  recordFailure,
};
