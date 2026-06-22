'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `receipts` table.
 * One receipt per payment — uniqueness enforced at DB level.
 */

async function findById(receiptId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM receipts WHERE id = $1',
    [receiptId]
  );
  return rows[0] ?? null;
}

async function findByPaymentId(paymentId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM receipts WHERE payment_id = $1',
    [paymentId]
  );
  return rows[0] ?? null;
}

async function findByReceiptNumber(receiptNumber, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM receipts WHERE receipt_number = $1',
    [receiptNumber]
  );
  return rows[0] ?? null;
}

/**
 * Creates a receipt record for a verified payment.
 * receipt_path is set later once the PDF has been generated.
 *
 * @param {{ paymentId, receiptNumber, receiptPath? }} data
 */
async function create({ paymentId, receiptNumber, receiptPath = null }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO receipts (payment_id, receipt_number, receipt_path)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [paymentId, receiptNumber, receiptPath]
  );
  return rows[0];
}

/**
 * Updates the receipt file path once the PDF has been generated.
 */
async function updatePath(receiptId, receiptPath, db = pool) {
  const { rows } = await db.query(
    `UPDATE receipts
        SET receipt_path = $1
      WHERE id = $2
     RETURNING *`,
    [receiptPath, receiptId]
  );
  return rows[0] ?? null;
}

async function findAllAdmin({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT r.*,
              p.transaction_uuid,
              p.amount,
              p.payment_status,
              o.order_number,
              u.username AS customer_name,
              u.email    AS customer_email
         FROM receipts r
         LEFT JOIN payments p ON r.payment_id = p.id
         LEFT JOIN orders o   ON p.order_id   = o.id
         LEFT JOIN users u    ON o.user_id     = u.uid
         ORDER BY r.generated_at DESC
         LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query('SELECT COUNT(*) AS total FROM receipts'),
  ]);

  return {
    receipts: dataResult.rows,
    total:    parseInt(countResult.rows[0].total, 10),
    page,
    limit,
  };
}

module.exports = {
  findById,
  findByPaymentId,
  findByReceiptNumber,
  findAllAdmin,
  create,
  updatePath,
};
