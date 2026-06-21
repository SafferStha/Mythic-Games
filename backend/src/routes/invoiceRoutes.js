'use strict';

const { Router }         = require('express');
const invoiceController  = require('../controllers/invoiceController');
const { authenticate }   = require('../middlewares/authMiddleware');

const router = Router();

/**
 * Invoice Routes — mounted at /api/invoice
 * All routes require a valid JWT.
 *
 * GET /api/invoice/download/:orderId  — stream PDF download
 * GET /api/invoice/:orderId           — fetch invoice metadata
 *
 * NOTE: /download/:orderId is registered FIRST to prevent Express matching
 * "download" as the :orderId parameter value.
 */
router.use(authenticate);

router.get('/download/:orderId', invoiceController.downloadInvoice);
router.get('/:orderId',          invoiceController.getInvoice);

module.exports = router;
