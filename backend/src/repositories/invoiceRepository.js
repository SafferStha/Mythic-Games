'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for the `invoices` table.
 * One invoice per order — uniqueness enforced at DB level.
 */

async function findById(invoiceId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM invoices WHERE id = $1',
    [invoiceId]
  );
  return rows[0] ?? null;
}

async function findByOrderId(orderId, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM invoices WHERE order_id = $1',
    [orderId]
  );
  return rows[0] ?? null;
}

async function findByInvoiceNumber(invoiceNumber, db = pool) {
  const { rows } = await db.query(
    'SELECT * FROM invoices WHERE invoice_number = $1',
    [invoiceNumber]
  );
  return rows[0] ?? null;
}

/**
 * Creates an invoice record for an order.
 * invoice_path is set later once the PDF file has been generated.
 *
 * @param {{ orderId, invoiceNumber, invoicePath? }} data
 */
async function create({ orderId, invoiceNumber, invoicePath = null }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO invoices (order_id, invoice_number, invoice_path)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [orderId, invoiceNumber, invoicePath]
  );
  return rows[0];
}

/**
 * Updates the invoice file path once the PDF has been generated.
 */
async function updatePath(invoiceId, invoicePath, db = pool) {
  const { rows } = await db.query(
    `UPDATE invoices
        SET invoice_path = $1
      WHERE id = $2
     RETURNING *`,
    [invoicePath, invoiceId]
  );
  return rows[0] ?? null;
}

module.exports = {
  findById,
  findByOrderId,
  findByInvoiceNumber,
  create,
  updatePath,
};
