'use strict';

const cartRepository     = require('../repositories/cartRepository');
const cartItemRepository = require('../repositories/cartItemRepository');
const gameRepository     = require('../repositories/gameRepository');
const { AppError }       = require('../utils/AppError');
const { GAME_STATUS }    = require('../constants/gameStatus');
const { calculateCartTotals, effectivePrice } = require('../utils/cartCalculator');

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Validates that a game exists, is purchasable, and has sufficient stock.
 *
 * @param {number} gameId
 * @param {number} requestedQty  The quantity being requested (not accumulated).
 * @returns {object} The validated game row.
 */
async function assertGameAvailable(gameId, requestedQty) {
  const game = await gameRepository.findById(gameId);

  if (!game) {
    throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');
  }

  if (game.status !== GAME_STATUS.ACTIVE) {
    throw AppError.badRequest(
      `"${game.title}" is not available for purchase`,
      'GAME_UNAVAILABLE'
    );
  }

  if (game.stock < requestedQty) {
    throw AppError.badRequest(
      `Insufficient stock for "${game.title}". Available: ${game.stock}`,
      'INSUFFICIENT_STOCK'
    );
  }

  return game;
}

/**
 * Verifies cart-item ownership in a single JOIN query.
 * Returns the raw cart_items row on success.
 * Throws 404 if item not found, not owned by user, or cart is not active.
 *
 * @param {number} cartItemId
 * @param {number} userId
 */
async function assertOwnership(cartItemId, userId) {
  const item = await cartItemRepository.findByIdAndUserId(cartItemId, userId);

  if (!item) {
    throw AppError.notFound(
      'Cart item not found or does not belong to your active cart',
      'CART_ITEM_NOT_FOUND'
    );
  }

  return item;
}

/**
 * Assembles the standardised cart response payload.
 * This is the canonical shape returned by every cart endpoint.
 *
 * Shape:
 * {
 *   cart:    { id, user_id, status, created_at, updated_at },
 *   items:   [ { id, cart_id, game_id, quantity, unit_price, subtotal,
 *                game_title, game_slug, game_cover_image,
 *                game_current_price, game_discount_price,
 *                game_stock, game_status } ],
 *   summary: { itemCount, subtotal, discount, taxRate, tax, grandTotal }
 * }
 */
async function buildCartResponse(cart) {
  const items   = await cartItemRepository.findByCartId(cart.id);
  const summary = calculateCartTotals(items);

  return {
    cart: {
      id:         cart.id,
      user_id:    cart.user_id,
      status:     cart.status,
      created_at: cart.created_at,
      updated_at: cart.updated_at,
    },
    items,
    summary,
  };
}

/**
 * Returns an empty cart response — used when no active cart exists.
 * Keeps the API shape consistent so clients don't have to null-check differently.
 */
function emptyCartResponse() {
  return {
    cart:    null,
    items:   [],
    summary: calculateCartTotals([]),
  };
}

// ── Public service methods ────────────────────────────────────────────────────

/**
 * POST /cart/add
 *
 * Adds a game to the user's active cart.
 * - Creates the cart if none exists.
 * - Increments quantity instead of creating a duplicate entry.
 * - Takes a price snapshot at add-to-cart time so future price changes
 *   do not silently change what the user agreed to pay.
 *
 * @param {number} userId
 * @param {{ gameId: number, quantity: number }} payload
 */
async function addToCart(userId, { gameId, quantity }) {
  // 1. Validate game availability and stock
  const game = await assertGameAvailable(gameId, quantity);

  // 2. Find or create the user's active cart (no extra query if cart exists)
  const cart = await cartRepository.findOrCreate(userId);

  // 3. Check for an existing cart item with the same game
  const existing = await cartItemRepository.findByCartAndGame(cart.id, gameId);

  if (existing) {
    // 3a. Game already in cart — increment quantity
    const newQty = existing.quantity + quantity;

    if (newQty > game.stock) {
      throw AppError.badRequest(
        `Cannot add ${quantity} more of "${game.title}". ` +
        `You already have ${existing.quantity} in your cart. ` +
        `Available stock: ${game.stock}`,
        'INSUFFICIENT_STOCK'
      );
    }

    await cartItemRepository.updateQuantity(existing.id, newQty);
  } else {
    // 3b. New item — snapshot the effective price at this moment
    const unitPrice = effectivePrice(game);

    await cartItemRepository.create({
      cartId:    cart.id,
      gameId:    game.id,
      quantity,
      unitPrice,
    });
  }

  return buildCartResponse(cart);
}

/**
 * GET /cart
 *
 * Returns the user's active cart with all items and computed totals.
 * Returns a consistent empty-cart shape if no active cart exists.
 *
 * @param {number} userId
 */
async function getCart(userId) {
  const cart = await cartRepository.findActiveByUserId(userId);

  if (!cart) {
    return emptyCartResponse();
  }

  return buildCartResponse(cart);
}

/**
 * PATCH /cart/update/:cartItemId
 *
 * Sets an item's quantity to an exact value.
 * Re-validates stock to prevent exceeding available inventory.
 *
 * @param {number} userId
 * @param {number} cartItemId
 * @param {{ quantity: number }} payload
 */
async function updateCartItem(userId, cartItemId, { quantity }) {
  // 1. Single-query ownership check
  const item = await assertOwnership(cartItemId, userId);

  // 2. Fetch the game to validate new stock requirement
  const game = await gameRepository.findById(item.game_id);
  if (!game) {
    throw AppError.notFound(
      'The game for this cart item is no longer available',
      'GAME_NOT_FOUND'
    );
  }

  if (quantity > game.stock) {
    throw AppError.badRequest(
      `Cannot set quantity to ${quantity}. Available stock: ${game.stock}`,
      'INSUFFICIENT_STOCK'
    );
  }

  // 3. Apply the update
  await cartItemRepository.updateQuantity(cartItemId, quantity);

  // 4. Return refreshed cart
  const cart = await cartRepository.findById(item.cart_id);
  return buildCartResponse(cart);
}

/**
 * DELETE /cart/remove/:cartItemId
 *
 * Removes one item from the cart.
 * Cart remains active even if it becomes empty — allows re-adding items
 * without re-creating the cart session.
 *
 * @param {number} userId
 * @param {number} cartItemId
 */
async function removeCartItem(userId, cartItemId) {
  // 1. Ownership check
  const item = await assertOwnership(cartItemId, userId);

  // 2. Delete the item
  await cartItemRepository.remove(cartItemId);

  // 3. Return refreshed (possibly empty) cart
  const cart = await cartRepository.findById(item.cart_id);
  return buildCartResponse(cart);
}

/**
 * DELETE /cart/clear
 *
 * Removes all items from the user's active cart.
 * The cart record itself is preserved — only items are deleted.
 *
 * @param {number} userId
 */
async function clearCart(userId) {
  const cart = await cartRepository.findActiveByUserId(userId);

  if (!cart) {
    return emptyCartResponse();
  }

  await cartItemRepository.clearByCartId(cart.id);

  return buildCartResponse(cart);
}

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
