'use strict';

const cartService = require('../services/cartService');
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateCartItemId,
} = require('../validators/cartValidator');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');

/**
 * POST /api/cart/add
 *
 * Adds a game to the authenticated user's cart.
 * Creates the cart automatically if it does not exist.
 */
const addToCart = asyncHandler(async (req, res) => {
  const payload = validateAddToCart(req.body);
  const result  = await cartService.addToCart(req.user.uid, payload);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Item added to cart',
    data:       result,
  });
});

/**
 * GET /api/cart
 *
 * Returns the authenticated user's active cart with items and totals.
 */
const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(req.user.uid);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Cart retrieved successfully',
    data:       result,
  });
});

/**
 * PATCH /api/cart/update/:cartItemId
 *
 * Sets a cart item's quantity to an exact value.
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const cartItemId = validateCartItemId(req.params);
  const payload    = validateUpdateCartItem(req.body);
  const result     = await cartService.updateCartItem(req.user.uid, cartItemId, payload);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Cart item updated',
    data:       result,
  });
});

/**
 * DELETE /api/cart/remove/:cartItemId
 *
 * Removes a single item from the cart.
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const cartItemId = validateCartItemId(req.params);
  const result     = await cartService.removeCartItem(req.user.uid, cartItemId);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Item removed from cart',
    data:       result,
  });
});

/**
 * DELETE /api/cart/clear
 *
 * Removes all items from the cart. Cart record is preserved.
 */
const clearCart = asyncHandler(async (req, res) => {
  const result = await cartService.clearCart(req.user.uid);

  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Cart cleared successfully',
    data:       result,
  });
});

module.exports = { addToCart, getCart, updateCartItem, removeCartItem, clearCart };
