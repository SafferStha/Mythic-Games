"use strict";

require("dotenv").config();

const optional = (name, defaultValue = "") =>
  process.env[name]?.trim() || defaultValue;

/**
 * Centralised, validated environment configuration.
 * All process.env access in the application must go through this module.
 */
const env = Object.freeze({
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: Number(optional("PORT", "5000")),

  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: optional("DATABASE_URL"),
  DB_HOST: optional("DB_HOST", "localhost"),
  DB_PORT: Number(optional("DB_PORT", "5432")),
  DB_NAME: optional("DB_NAME"),
  DB_USER: optional("DB_USER"),
  DB_PASSWORD: optional("DB_PASSWORD"),
  DB_SSL: optional("DB_SSL", "false") === "true",

  // ── JWT ───────────────────────────────────────────────────────────────────
  // In production these MUST be strong random secrets (≥ 32 chars).
  JWT_SECRET: optional("JWT_SECRET", "mythic-dev-secret-change-in-production"),
  JWT_REFRESH_SECRET: optional(
    "JWT_REFRESH_SECRET",
    "mythic-dev-refresh-change-in-production",
  ),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: optional("JWT_REFRESH_EXPIRES_IN", "7d"),

  // ── CORS ──────────────────────────────────────────────────────────────────
  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:5173"),

  // ── Cart / Commerce ───────────────────────────────────────────────────────
  // VAT / tax rate applied to cart totals (0.13 = 13%).
  // Override per environment — e.g. 0 for tax-exempt regions.
  CART_TAX_RATE: parseFloat(optional("CART_TAX_RATE", "0.13")),

  // ── Frontend ──────────────────────────────────────────────────────────────
  // Base URL of the React app — used for post-payment redirects.
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173"),

  // ── eSewa Payment Gateway ─────────────────────────────────────────────────
  // Use EPAYTEST / UAT credentials for development.
  // Replace with live credentials for production.
  ESEWA_MERCHANT_CODE: optional("ESEWA_MERCHANT_CODE", "EPAYTEST"),
  ESEWA_SECRET_KEY: optional("ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q"),
  ESEWA_PAYMENT_URL: optional(
    "ESEWA_PAYMENT_URL",
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  ),
  ESEWA_VERIFICATION_URL: optional(
    "ESEWA_VERIFICATION_URL",
    "https://rc-epay.esewa.com.np/api/epay/transaction/v2/status/",
  ),
  ESEWA_SUCCESS_URL: optional(
    "ESEWA_SUCCESS_URL",
    "http://localhost:5000/api/payment/esewa/success",
  ),
  ESEWA_FAILURE_URL: optional(
    "ESEWA_FAILURE_URL",
    "http://localhost:5000/api/payment/esewa/failure",
  ),
});

module.exports = env;
