'use strict';

const { generateReceiptNumber } = require('./documentNumberGenerator');

/**
 * Receipt number generator.
 * Format: REC-YYYYMMDD-XXXXXX
 * Example: REC-20260622-873621
 *
 * Delegates to documentNumberGenerator — single source of truth.
 * DB UNIQUE constraint on receipts.receipt_number is the final collision guard.
 */
module.exports = { generateReceiptNumber };
