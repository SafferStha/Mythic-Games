'use strict';

const { Router }           = require('express');
const wishlistCtrl         = require('../controllers/wishlistController');
const { authenticate }     = require('../middlewares/authMiddleware');

const router = Router();
router.use(authenticate);

router.get('/',                     wishlistCtrl.getWishlist);
router.post('/add',                 wishlistCtrl.addToWishlist);
router.delete('/remove/:gameId',    wishlistCtrl.removeFromWishlist);
router.post('/move-to-cart/:gameId', wishlistCtrl.moveToCart);

module.exports = router;
