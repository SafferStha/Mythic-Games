const { pool } = require('../database/db');

/**
 * Saves a new OTP code for an email, deleting any existing codes for that email.
 * @param {string} email 
 * @param {string} otpCode 
 * @param {Date} expiresAt 
 * @returns {Promise<object>} The newly inserted OTP record.
 */
async function saveOTP(email, otpCode, expiresAt) {
  // Delete existing OTPs for the email
  await pool.query('DELETE FROM otp_verifications WHERE LOWER(email) = LOWER($1)', [email]);

  // Insert new OTP
  const result = await pool.query(
    `INSERT INTO otp_verifications (email, otp_code, expires_at)
     VALUES (LOWER($1), $2, $3)
     RETURNING *`,
    [email, otpCode, expiresAt]
  );

  return result.rows[0];
}

/**
 * Retrieves a valid, non-expired OTP record for an email.
 * @param {string} email 
 * @param {string} otpCode 
 * @returns {Promise<object|null>} The OTP record if valid, otherwise null.
 */
async function getValidOTP(email, otpCode) {
  const result = await pool.query(
    `SELECT * FROM otp_verifications
     WHERE LOWER(email) = LOWER($1)
       AND otp_code = $2
       AND expires_at > NOW()
     LIMIT 1`,
    [email, otpCode]
  );

  return result.rows[0] || null;
}

/**
 * Consumes/deletes all OTP codes for a specific email.
 * @param {string} email 
 * @returns {Promise<boolean>} True if any record was deleted, false otherwise.
 */
async function deleteOTP(email) {
  const result = await pool.query(
    'DELETE FROM otp_verifications WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rowCount > 0;
}

module.exports = {
  saveOTP,
  getValidOTP,
  deleteOTP,
};
