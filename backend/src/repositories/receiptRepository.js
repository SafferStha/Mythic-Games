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

module.exports = {
  findById,
  findByPaymentId,
  findByReceiptNumber,
  create,
  updatePath,
};
