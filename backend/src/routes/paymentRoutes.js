'use strict';

const { Router }        = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate }  = require('../middlewares/authMiddleware');

const router = Router();

/**
 * eSewa Payment Routes — mounted at /api/payment
 *
 * POST /api/payment/esewa/initiate  — create payment record + signed eSewa payload (JWT required)
 * GET  /api/payment/esewa/success   — eSewa success callback — public, no JWT
 * GET  /api/payment/esewa/failure   — eSewa failure callback — public, no JWT
 * POST /api/payment/esewa/verify    — manual verification by transaction UUID (JWT required)
 *
 * Callbacks (success/failure) are intentionally public because eSewa redirects
 * the user's browser here after payment — no Authorization header is available.
 * Security is enforced at the service layer via HMAC signature + API verification.
 */

// Public callbacks — no authentication middleware
router.get('/esewa/success', paymentController.handleEsewaSuccess);
router.get('/esewa/failure', paymentController.handleEsewaFailure);

// Authenticated endpoints
router.post('/esewa/initiate', authenticate, paymentController.initiateEsewaPayment);
router.post('/esewa/verify',   authenticate, paymentController.verifyEsewaPayment);

module.exports = router;
