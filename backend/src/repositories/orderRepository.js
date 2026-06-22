'use strict';

const { pool } = require('../config/database');

const ORDER_FIELDS = `
  o.id, o.user_id, o.cart_id, o.order_number,
  o.subtotal, o.tax, o.discount, o.grand_total,
  o.payment_status, o.order_status, o.notes,
  o.created_at, o.updated_at
`;

/**
 * Raw data-access layer for the `orders` table.
 *
 * All write operations accept an optional `db` parameter so they
 * can participate in caller-managed transactions.
 */

async function findById(orderId, db = pool) {
  const { rows } = await db.query(
    `SELECT ${ORDER_FIELDS} FROM orders o WHERE o.id = $1`,
    [orderId]
  );
  return rows[0] ?? null;
}

async function findByOrderNumber(orderNumber, db = pool) {
  const { rows } = await db.query(
    `SELECT ${ORDER_FIELDS} FROM orders o WHERE o.order_number = $1`,
    [orderNumber]
  );
  return rows[0] ?? null;
}

/**
 * Returns all orders for a user, newest first.
 * Optionally filtered by payment_status or order_status.
 */
async function findByUserId(userId, { paymentStatus, orderStatus } = {}) {
  const conditions = ['o.user_id = $1'];
  const params     = [userId];
  let   idx        = 2;

  if (paymentStatus) {
    conditions.push(`o.payment_status = $${idx++}`);
    params.push(paymentStatus);
  }

  if (orderStatus) {
    conditions.push(`o.order_status = $${idx++}`);
    params.push(orderStatus);
  }

  const { rows } = await pool.query(
    `SELECT ${ORDER_FIELDS}
       FROM orders o
      WHERE ${conditions.join(' AND ')}
      ORDER BY o.created_at DESC`,
    params
  );
  return rows;
}

/**
 * Creates a new order. Designed to run inside a transaction.
 */
async function create({
  userId, cartId, orderNumber,
  subtotal, tax, discount, grandTotal, notes,
}, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO orders
       (user_id, cart_id, order_number, subtotal, tax, discount, grand_total, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${ORDER_FIELDS.replace(/o\./g, '')}`,
    [userId, cartId ?? null, orderNumber, subtotal, tax, discount, grandTotal, notes ?? null]
  );
  return rows[0];
}

async function updatePaymentStatus(orderId, paymentStatus, db = pool) {
  const { rows } = await db.query(
    `UPDATE orders
        SET payment_status = $1,
            updated_at     = NOW()
      WHERE id = $2
     RETURNING id, order_number, payment_status, order_status`,
    [paymentStatus, orderId]
  );
  return rows[0] ?? null;
}

async function updateOrderStatus(orderId, orderStatus, db = pool) {
  const { rows } = await db.query(
    `UPDATE orders
        SET order_status = $1,
            updated_at   = NOW()
      WHERE id = $2
     RETURNING id, order_number, payment_status, order_status`,
    [orderStatus, orderId]
  );
  return rows[0] ?? null;
}

/**
 * Updates both statuses in a single query (used during checkout completion).
 */
async function updateStatuses(orderId, { paymentStatus, orderStatus }, db = pool) {
  const { rows } = await db.query(
    `UPDATE orders
        SET payment_status = $1,
            order_status   = $2,
            updated_at     = NOW()
      WHERE id = $3
     RETURNING id, order_number, payment_status, order_status`,
    [paymentStatus, orderStatus, orderId]
  );
  return rows[0] ?? null;
}

// ── Admin-only methods ────────────────────────────────────────────────────────

async function findAllAdmin({
  page = 1, limit = 20,
  orderStatus = null, paymentStatus = null, search = null,
} = {}) {
  const conditions = [];
  const params     = [];
  let   idx        = 1;

  if (orderStatus) {
    conditions.push(`o.order_status = $${idx++}`);
    params.push(orderStatus);
  }

  if (paymentStatus) {
    conditions.push(`o.payment_status = $${idx++}`);
    params.push(paymentStatus);
  }

  if (search) {
    conditions.push(`o.order_number ILIKE $${idx++}`);
    params.push(`%${search}%`);
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ${ORDER_FIELDS},
              u.username AS customer_name,
              u.email    AS customer_email
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.uid
         ${where}
         ORDER BY o.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${where}`,
      params
    ),
  ]);

  return {
    orders: dataResult.rows,
    total:  parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  };
}

module.exports = {
  findById,
  findByOrderNumber,
  findByUserId,
  findAllAdmin,
  create,
  updatePaymentStatus,
  updateOrderStatus,
  updateStatuses,
};
