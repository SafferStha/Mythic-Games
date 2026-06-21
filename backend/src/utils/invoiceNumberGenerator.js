'use strict';

const { generateInvoiceNumber } = require('./documentNumberGenerator');

/**
 * Invoice number generator.
 * Format: INV-YYYYMMDD-XXXXXX
 * Example: INV-20260622-384721
 *
 * Delegates to documentNumberGenerator — single source of truth.
 * DB UNIQUE constraint on invoices.invoice_number is the final collision guard.
 */
module.exports = { generateInvoiceNumber };
