'use strict';

// Set test environment variables before any module loads.
// Uses setupFiles (runs before test framework) — no jest globals available here.
process.env.NODE_ENV               = 'test';
process.env.PORT                   = '5001';
process.env.JWT_SECRET             = 'test-jwt-secret-at-least-32-characters-long!!';
process.env.JWT_REFRESH_SECRET     = 'test-refresh-secret-at-least-32-chars!!';
process.env.JWT_EXPIRES_IN         = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN            = 'http://localhost:5173';
process.env.CART_TAX_RATE          = '0.13';
process.env.FRONTEND_URL           = 'http://localhost:5173';
process.env.ESEWA_MERCHANT_CODE    = 'EPAYTEST';
process.env.ESEWA_SECRET_KEY       = '8gBm/:&EnhH.1/q';
process.env.ESEWA_PAYMENT_URL      = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
process.env.ESEWA_VERIFICATION_URL = 'https://rc-epay.esewa.com.np/api/epay/transaction/v2/status/';
process.env.ESEWA_SUCCESS_URL      = 'http://localhost:5001/api/payment/esewa/success';
process.env.ESEWA_FAILURE_URL      = 'http://localhost:5001/api/payment/esewa/failure';
