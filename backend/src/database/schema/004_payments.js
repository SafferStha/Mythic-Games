'use strict';

/**
 * Migration 004 — Payments, Invoices & Receipts Schema
 *
 * Tables: payments, invoices, receipts
 *
 * FK strategies:
 *   payments.order_id  → ON DELETE RESTRICT (can't delete order with payments)
 *   invoices.order_id  → ON DELETE RESTRICT (can't delete invoiced order)
 *   receipts.payment_id→ ON DELETE RESTRICT (can't delete verified payment)
 *
 * Both invoices and receipts have a 1:1 relationship enforced via UNIQUE
 * on the FK column rather than a separate UNIQUE constraint.
 */
module.exports = async function paymentsSchema(client) {
  // ── Payments ─────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id                SERIAL        PRIMARY KEY,
      order_id          INTEGER       NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
      provider          VARCHAR(50)   NOT NULL DEFAULT 'esewa',
      transaction_uuid  VARCHAR(100)  UNIQUE NOT NULL,
      payment_reference VARCHAR(255),
      amount            NUMERIC(10,2) NOT NULL,
      payment_status    VARCHAR(20)   NOT NULL DEFAULT 'initiated',
      gateway_response  JSONB,
      failure_reason    TEXT,
      created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT payments_amount_positive  CHECK (amount > 0),
      CONSTRAINT payments_status_valid     CHECK (payment_status IN ('initiated','verified','failed')),
      CONSTRAINT payments_provider_valid   CHECK (provider       IN ('esewa','stripe','paypal'))
    );

    CREATE INDEX IF NOT EXISTS idx_payments_order_id        ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_transaction_uuid ON payments(transaction_uuid);
    CREATE INDEX IF NOT EXISTS idx_payments_status          ON payments(payment_status);
  `);

  // ── Invoices ─────────────────────────────────────────────────────────────────
  // One invoice per order (enforced by UNIQUE on order_id).
  await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id             SERIAL      PRIMARY KEY,
      order_id       INTEGER     NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      invoice_path   TEXT,
      generated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_invoices_order_id       ON invoices(order_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
  `);

  // ── Receipts ─────────────────────────────────────────────────────────────────
  // One receipt per payment (enforced by UNIQUE on payment_id).
  await client.query(`
    CREATE TABLE IF NOT EXISTS receipts (
      id             SERIAL      PRIMARY KEY,
      payment_id     INTEGER     NOT NULL UNIQUE REFERENCES payments(id) ON DELETE RESTRICT,
      receipt_number VARCHAR(50) UNIQUE NOT NULL,
      receipt_path   TEXT,
      generated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_receipts_payment_id     ON receipts(payment_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
  `);
};
