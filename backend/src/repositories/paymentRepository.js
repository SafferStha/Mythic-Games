"use strict";

const { pool } = require("../config/database");

/**
 * Raw data-access layer for the `payments` table.
 */

async function findById(paymentId, db = pool) {
  const { rows } = await db.query("SELECT * FROM payments WHERE id = $1", [
    paymentId,
  ]);
  return rows[0] ?? null;
}

async function findByOrderId(orderId, db = pool) {
  const { rows } = await db.query(
    `SELECT * FROM payments
      WHERE order_id = $1
      ORDER BY created_at DESC`,
    [orderId],
  );
  return rows;
}

async function findByTransactionUuid(transactionUuid, db = pool) {
  const { rows } = await db.query(
    "SELECT * FROM payments WHERE transaction_uuid = $1",
    [transactionUuid],
  );
  return rows[0] ?? null;
}

/**
 * Creates a payment initiation record.
 * Called before redirecting the user to the payment gateway.
 */
async function create(
  { orderId, provider, transactionUuid, amount },
  db = pool,
) {
  const { rows } = await db.query(
    `INSERT INTO payments (order_id, provider, transaction_uuid, amount)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orderId, provider, transactionUuid, amount],
  );
  return rows[0];
}

/**
 * Records the gateway verification result.
 * Stores the full raw response for audit purposes.
 */
async function recordVerification(
  { paymentId, paymentStatus, paymentReference, gatewayResponse },
  db = pool,
) {
  const { rows } = await db.query(
    `UPDATE payments
        SET payment_status    = $1,
            payment_reference = $2,
            gateway_response  = $3,
            updated_at        = NOW()
      WHERE id = $4
     RETURNING *`,
    [
      paymentStatus,
      paymentReference ?? null,
      gatewayResponse ?? null,
      paymentId,
    ],
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
    [failureReason ?? null, paymentId],
  );
  return rows[0] ?? null;
}

/**
 * General-purpose status updater — handles all transition scenarios
 * (initiated → verified, initiated → failed, etc.) in a single query.
 * Sets only the columns provided; null values are stored explicitly.
 *
 * @param {{
 *   paymentId:        number,
 *   paymentStatus:    string,
 *   paymentReference: string|null,
 *   gatewayResponse:  object|null,
 *   failureReason:    string|null,
 * }} params
 */
async function updateStatus(
  {
    paymentId,
    paymentStatus,
    paymentReference = null,
    gatewayResponse = null,
    failureReason = null,
  },
  db = pool,
) {
  const { rows } = await db.query(
    `UPDATE payments
        SET payment_status    = $1,
            payment_reference = $2,
            gateway_response  = $3,
            failure_reason    = $4,
            updated_at        = NOW()
      WHERE id = $5
     RETURNING *`,
    [
      paymentStatus,
      paymentReference,
      gatewayResponse !== null ? JSON.stringify(gatewayResponse) : null,
      failureReason,
      paymentId,
    ],
  );
  return rows[0] ?? null;
}

// ── Admin-only methods ────────────────────────────────────────────────────────

async function findAllAdmin({ page = 1, limit = 20, status = null } = {}) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (status) {
    conditions.push(`p.payment_status = $${idx++}`);
    params.push(status);
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT p.*,
              o.order_number,
              u.username AS customer_name,
              u.email    AS customer_email
         FROM payments p
         LEFT JOIN orders o ON p.order_id = o.id
         LEFT JOIN users u  ON o.user_id  = u.uid
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total FROM payments p ${where}`,
      params
    ),
  ]);

  return {
    payments: dataResult.rows,
    total:    parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  };
}

module.exports = {
  findById,
  findByOrderId,
  findByTransactionUuid,
  findAllAdmin,
  create,
  recordVerification,
  recordFailure,
  updateStatus,
};
