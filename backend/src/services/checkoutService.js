'use strict';

const { pool }            = require('../config/database');
const cartRepository      = require('../repositories/cartRepository');
const cartItemRepository  = require('../repositories/cartItemRepository');
const gameRepository      = require('../repositories/gameRepository');
const orderRepository     = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const { AppError }        = require('../utils/AppError');
const { GAME_STATUS, CART_STATUS } = require('../constants/gameStatus');
const { calculateCartTotals }      = require('../utils/cartCalculator');
const { generateOrderNumber }      = require('../utils/orderNumberGenerator');

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Pre-flight validation: checks every cart item for game availability and stock.
 *
 * Collects ALL errors before throwing so the user sees the full picture at once
 * (e.g. "Game A unavailable AND Game B out of stock") rather than one error at a time.
 *
 * @param {object[]} cartItems  Enriched rows from cartItemRepository.findByCartId
 * @returns {object[]}          Array of per-item errors (empty = all clear)
 */
function collectCartValidationErrors(cartItems) {
  const errors = [];

  for (const item of cartItems) {
    if (item.game_status !== GAME_STATUS.ACTIVE) {
      errors.push({
        game_id:   item.game_id,
        game_title: item.game_title,
        message:   `"${item.game_title}" is no longer available for purchase`,
        code:      'GAME_UNAVAILABLE',
      });
      continue; // no point checking stock if game is unavailable
    }

    if (item.game_stock < item.quantity) {
      errors.push({
        game_id:    item.game_id,
        game_title: item.game_title,
        message:    `"${item.game_title}": requested ${item.quantity}, available ${item.game_stock}`,
        code:       'INSUFFICIENT_STOCK',
      });
    }
  }

  return errors;
}

// ── Public service ────────────────────────────────────────────────────────────

/**
 * processCheckout — the single entry point for the checkout flow.
 *
 * Executes every step inside ONE PostgreSQL transaction.
 * All steps succeed together or the entire operation is rolled back.
 *
 * Flow:
 *   BEGIN
 *   1. Assert user has an active cart
 *   2. Fetch cart items (with live game data via JOIN)
 *   3. Assert cart is not empty
 *   4. Pre-flight: validate game status + stock (collect all errors)
 *   5. Calculate order totals via cartCalculator
 *   6. Generate unique order number
 *   7. INSERT order record
 *   8. Bulk-INSERT order_items (immutable price snapshot)
 *   9. Atomic stock decrement per game (WHERE stock >= qty)
 *  10. Mark cart as 'converted'
 *   COMMIT
 *
 * On any failure → ROLLBACK → re-throw the error
 *
 * @param {number|string} userId
 * @param {{ notes?: string|null }} options
 * @returns {{ order: object, items: object[], summary: object }}
 */
async function processCheckout(userId, { notes = null } = {}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Assert active cart ─────────────────────────────────────────────────
    const cart = await cartRepository.findActiveByUserId(userId, client);

    if (!cart) {
      throw AppError.badRequest(
        'No active cart found. Add items to your cart before checking out',
        'NO_ACTIVE_CART'
      );
    }

    // ── 2. Fetch cart items (enriched with game data) ─────────────────────────
    // findByCartId JOINs games → returns game_status, game_stock, game_title, etc.
    const cartItems = await cartItemRepository.findByCartId(cart.id, client);

    // ── 3. Assert cart is not empty ───────────────────────────────────────────
    if (cartItems.length === 0) {
      throw AppError.badRequest(
        'Your cart is empty. Add items before checking out',
        'CART_EMPTY'
      );
    }

    // ── 4. Pre-flight validation ──────────────────────────────────────────────
    // Read live game data from the JOIN and verify status + stock.
    // This is a UX guard — the atomic decrement in step 9 is the true guard.
    const validationErrors = collectCartValidationErrors(cartItems);

    if (validationErrors.length > 0) {
      const err = AppError.badRequest(
        `${validationErrors.length} item(s) in your cart cannot be purchased`,
        'CART_VALIDATION_FAILED'
      );
      err.errors = validationErrors;
      throw err;
    }

    // ── 5. Calculate totals ───────────────────────────────────────────────────
    // cartCalculator reads item.subtotal (unit_price × quantity, snapshotted at add-time)
    const totals = calculateCartTotals(cartItems);

    // ── 6. Generate order number ──────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    // ── 7. Create order record ────────────────────────────────────────────────
    const order = await orderRepository.create(
      {
        userId:     cart.user_id,
        cartId:     cart.id,
        orderNumber,
        subtotal:   totals.subtotal,
        tax:        totals.tax,
        discount:   totals.discount,
        grandTotal: totals.grandTotal,
        notes,
      },
      client
    );

    // ── 8. Bulk-insert order items (price snapshot) ───────────────────────────
    // Prices come from cart_items.unit_price — snapshotted at add-to-cart time.
    // This makes order history immune to future price changes.
    const orderItemsPayload = cartItems.map((item) => ({
      orderId:   order.id,
      gameId:    item.game_id,
      quantity:  item.quantity,
      price:     parseFloat(item.unit_price),
      subtotal:  parseFloat(item.subtotal),
      gameTitle: item.game_title,
    }));

    const orderItems = await orderItemRepository.bulkCreate(orderItemsPayload, client);

    // ── 9. Atomic stock decrement ─────────────────────────────────────────────
    // Uses WHERE id = $2 AND stock >= $1 — returns null if stock is insufficient.
    // This is race-condition safe: concurrent transactions cannot both succeed
    // if the total quantity would push stock below 0.
    for (const item of cartItems) {
      const updated = await gameRepository.decrementStock(
        item.game_id,
        item.quantity,
        client
      );

      if (!updated) {
        // Another transaction exhausted the stock after our pre-check
        const err = AppError.badRequest(
          `"${item.game_title}" ran out of stock during checkout. Please update your cart`,
          'STOCK_DEPLETED'
        );
        throw err;
      }
    }

    // ── 10. Convert the cart ──────────────────────────────────────────────────
    // Cart status → 'converted': prevents re-checkout, preserved for audit history.
    await cartRepository.updateStatus(cart.id, CART_STATUS.CONVERTED, client);

    // ── COMMIT ────────────────────────────────────────────────────────────────
    await client.query('COMMIT');

    return {
      order,
      items:   orderItems,
      summary: totals,
    };

  } catch (error) {
    // Roll back every change — nothing is persisted on failure
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { processCheckout };
