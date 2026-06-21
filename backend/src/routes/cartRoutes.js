'use strict';

const { Router }       = require('express');
const cartController   = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * All cart routes require a valid JWT.
 * The authenticate middleware sets req.user = { uid, username, email, role }
 */
router.use(authenticate);

// POST   /api/cart/add               — add game to cart
// GET    /api/cart                   — get active cart + totals
// PATCH  /api/cart/update/:cartItemId — set item quantity
// DELETE /api/cart/remove/:cartItemId — remove one item
// DELETE /api/cart/clear             — remove all items

router.post  ('/add',              cartController.addToCart);
router.get   ('/',                 cartController.getCart);
router.patch ('/update/:cartItemId', cartController.updateCartItem);
router.delete('/remove/:cartItemId', cartController.removeCartItem);
router.delete('/clear',            cartController.clearCart);

module.exports = router;
