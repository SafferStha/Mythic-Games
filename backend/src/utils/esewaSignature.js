'use strict';

const crypto = require('crypto');

/**
 * eSewa v2 Signature Utilities
 *
 * eSewa v2 uses HMAC-SHA256 signatures to authenticate payment requests
 * and verify gateway callbacks.
 *
 * Signature algorithm:
 *   1. Build message:  "field1=value1,field2=value2,..."
 *   2. HMAC-SHA256 with the merchant secret key
 *   3. Base64-encode the digest
 *
 * Reference: https://developer.esewa.com.np/
 */

/**
 * Generates an eSewa payment signature for the initiation payload.
 *
 * Signed fields (in order): total_amount, transaction_uuid, product_code
 *
 * @param {{
 *   totalAmount:     string,   e.g. "1130.00"
 *   transactionUuid: string,   UUID for this payment attempt
 *   productCode:     string,   merchant code from eSewa portal
 *   secretKey:       string,   HMAC secret from eSewa portal
 * }} params
 * @returns {string}  Base64-encoded HMAC-SHA256 signature
 */
function generateSignature({ totalAmount, transactionUuid, productCode, secretKey }) {
  const message = [
    `total_amount=${totalAmount}`,
    `transaction_uuid=${transactionUuid}`,
    `product_code=${productCode}`,
  ].join(',');

  return crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
}

/**
 * Verifies the HMAC-SHA256 signature on an eSewa callback payload.
 *
 * eSewa includes `signed_field_names` listing the fields and order used
 * to build the signature.  We rebuild the message from those fields,
 * compute the expected signature, and compare using constant-time equality
 * to prevent timing-based attacks.
 *
 * @param {object} callbackData  Parsed JSON from eSewa callback
 * @param {string} secretKey     HMAC secret from eSewa portal
 * @returns {boolean}
 */
function verifyCallbackSignature(callbackData, secretKey) {
  try {
    const { signed_field_names, signature } = callbackData;

    if (!signed_field_names || !signature) return false;

    // Reconstruct message in the exact order eSewa specifies
    const fields  = signed_field_names.split(',');
    const message = fields.map((f) => `${f}=${callbackData[f] ?? ''}`).join(',');

    const expectedSig = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64');

    // Decode both signatures to raw bytes for constant-time comparison
    const sigBuf = Buffer.from(signature, 'base64');
    const expBuf = Buffer.from(expectedSig, 'base64');

    // Different lengths → different hashes → definitely invalid
    if (sigBuf.length !== expBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Decodes eSewa's Base64-encoded callback data from the ?data= query param.
 *
 * eSewa encodes the callback payload as a Base64 JSON string.
 *
 * @param {string} encoded  Raw value of the ?data= query parameter
 * @returns {object|null}   Parsed callback object, or null on failure
 */
function decodeCallbackData(encoded) {
  if (!encoded) return null;

  try {
    const json = Buffer.from(encoded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

module.exports = { generateSignature, verifyCallbackSignature, decodeCallbackData };
