'use strict';

const { Router }         = require('express');
const checkoutController = require('../controllers/checkoutController');
const { authenticate }   = require('../middlewares/authMiddleware');

const router = Router();

/**
 * All checkout routes require a valid JWT.
 *
 * POST /api/checkout  — converts active cart into a pending order
 */
router.use(authenticate);

router.post('/', checkoutController.checkout);

module.exports = router;
