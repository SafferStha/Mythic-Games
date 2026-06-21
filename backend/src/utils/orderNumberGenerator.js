'use strict';

const crypto = require('crypto');

/**
 * Generates a unique, human-readable order number.
 *
 * Format:  MG-YYYYMMDD-XXXXXX
 * Example: MG-20260621-928173
 *
 * Uses crypto.randomBytes (not Math.random) so the suffix is
 * cryptographically unpredictable and resistant to enumeration.
 *
 * Collision probability: ~1 in 1 000 000 per day.
 * The UNIQUE constraint on orders.order_number is the final safety net —
 * the caller must handle a DB unique-constraint error by retrying.
 *
 * @returns {string}
 */
function generateOrderNumber() {
  const now   = new Date();
  const year  = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day   = String(now.getUTCDate()).padStart(2, '0');

  // 3 random bytes → unsigned int 0-16 777 215, taken mod 1 000 000 → 6 digits
  const rand   = crypto.randomBytes(3).readUIntBE(0, 3) % 1_000_000;
  const suffix = String(rand).padStart(6, '0');

  return `MG-${year}${month}${day}-${suffix}`;
}

module.exports = { generateOrderNumber };
