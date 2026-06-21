'use strict';

const { Router }         = require('express');
const receiptController  = require('../controllers/receiptController');
const { authenticate }   = require('../middlewares/authMiddleware');

const router = Router();

/**
 * Receipt Routes — mounted at /api/receipt
 * All routes require a valid JWT.
 *
 * GET /api/receipt/download/:paymentId  — stream PDF download
 * GET /api/receipt/:paymentId           — fetch receipt metadata
 *
 * NOTE: /download/:paymentId is registered FIRST to prevent Express matching
 * "download" as the :paymentId parameter value.
 */
router.use(authenticate);

router.get('/download/:paymentId', receiptController.downloadReceipt);
router.get('/:paymentId',          receiptController.getReceipt);

module.exports = router;
