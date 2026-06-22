'use strict';

const { Router }         = require('express');
const checkoutController = require('../controllers/checkoutController');
const couponController   = require('../controllers/couponController');
const { authenticate }   = require('../middlewares/authMiddleware');

const router = Router();
router.use(authenticate);

router.post('/',             checkoutController.checkout);
router.post('/apply-coupon', couponController.applyCoupon);

module.exports = router;
