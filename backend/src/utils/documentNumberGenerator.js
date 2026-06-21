'use strict';

const crypto = require('crypto');

/**
 * Document number generators for financial records.
 *
 * Format: PREFIX-YYYYMMDD-XXXXXX
 * Examples:
 *   INV-20260622-724519
 *   REC-20260622-391024
 *
 * Uses crypto.randomBytes for unpredictability.
 * DB UNIQUE constraints are the final collision guard.
 */

function buildDocumentNumber(prefix) {
  const now    = new Date();
  const year   = now.getUTCFullYear();
  const month  = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day    = String(now.getUTCDate()).padStart(2, '0');
  const rand   = crypto.randomBytes(3).readUIntBE(0, 3) % 1_000_000;
  const suffix = String(rand).padStart(6, '0');
  return `${prefix}-${year}${month}${day}-${suffix}`;
}

/**
 * Generates an invoice number.
 * Format: INV-YYYYMMDD-XXXXXX
 */
function generateInvoiceNumber() {
  return buildDocumentNumber('INV');
}

/**
 * Generates a receipt number.
 * Format: REC-YYYYMMDD-XXXXXX
 */
function generateReceiptNumber() {
  return buildDocumentNumber('REC');
}

module.exports = { generateInvoiceNumber, generateReceiptNumber };
