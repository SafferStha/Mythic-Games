const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Sends a 6-digit OTP code to the user's email.
 * Configurable via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env variables.
 * Falls back to logging the OTP code in console for development if env values are missing.
 * @param {string} email 
 * @param {string} otp 
 * @returns {Promise<boolean>} True if mail was sent or simulation succeeded.
 */
async function sendOTPEmail(email, otp) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const mailOptions = {
    from: smtpUser || '"Mythic Games Support" <noreply@mythicgames.com>',
    to: email,
    subject: 'Password Reset OTP - Mythic Games',
    text: `Your OTP for resetting your password is: ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your Mythic Games account. Use the following 6-digit OTP code to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #f3f4f6; color: #6366f1; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px 30px; border-radius: 6px; border: 1px dashed #6366f1;">
            ${otp}
          </span>
        </div>
        <p>This code is valid for <strong>5 minutes</strong>. If you did not make this request, you can safely ignore this email and your password will remain unchanged.</p>
        <br/>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #777; text-align: center;">Mythic Games Support Team</p>
      </div>
    `
  };

  // If SMTP variables are missing, log the OTP code and return true (development simulation)
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`\n======================================================`);
    console.log(`[OTP Verification] SMTP configurations are not fully set in backend/.env.`);
    console.log(`[OTP Verification] Simulating email sending to: ${email}`);
    console.log(`[OTP Verification] YOUR OTP CODE IS: ${otp}`);
    console.log(`======================================================\n`);
    return true; 
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail(mailOptions);
    console.log(`[OTP Verification] OTP email successfully sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[OTP Verification] Failed to send email via SMTP:`, error);
    console.log(`[OTP Verification] Dev Fallback - YOUR OTP CODE IS: ${otp}`);
    return true;
  }
}

module.exports = {
  sendOTPEmail,
};
