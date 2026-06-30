const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

console.log('\n========== SMTP CONFIG CHECK ==========');
console.log('SMTP_HOST :', smtpHost);
console.log('SMTP_PORT :', smtpPort);
console.log('SMTP_USER :', smtpUser);
console.log('SMTP_PASS :', smtpPass ? `SET (${smtpPass.length} chars)` : 'NOT SET');
console.log('=======================================\n');

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error('❌ SMTP credentials are missing or still placeholder in .env!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: Number(smtpPort),
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

console.log('🔄 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection FAILED:', error.message);
    console.error('Error code:', error.code);
    if (error.responseCode === 535) {
      console.error('\n🔑 FIX: Your App Password is wrong.');
      console.error('   - Go to: https://myaccount.google.com/apppasswords');
      console.error('   - Delete old app password, create a NEW one');
      console.error('   - Paste WITHOUT spaces into SMTP_PASS in .env');
    }
  } else {
    console.log('✅ SMTP connection SUCCESS! Sending test email to:', smtpUser);
    transporter.sendMail({
      from: smtpUser,
      to: smtpUser,
      subject: 'Mythic Games - SMTP Test',
      text: 'SMTP is working! Your OTP emails will now be delivered.',
    }, (err, info) => {
      if (err) {
        console.error('❌ Send failed:', err.message);
      } else {
        console.log('✅ Test email sent! Check your inbox (and spam).');
        console.log('   Message ID:', info.messageId);
      }
    });
  }
});
