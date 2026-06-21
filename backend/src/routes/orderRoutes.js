'use strict';

const { Router }       = require('express');
const orderController  = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * All order routes require a valid JWT.
 *
 * GET /api/orders            — list authenticated user's orders
 * GET /api/orders/:orderId   — get single order with items (ownership enforced)
 */
router.use(authenticate);

router.get('/',           orderController.getMyOrders);
router.get('/:orderId',   orderController.getOrder);

module.exports = router;
