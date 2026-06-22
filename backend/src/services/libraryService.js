'use strict';

const libraryRepository   = require('../repositories/libraryRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const { AppError }        = require('../utils/AppError');

async function getLibrary(userId) {
  const items = await libraryRepository.findByUserId(userId);
  const total = items.length;
  return { items, total };
}

async function isGameOwned(userId, gameId) {
  return libraryRepository.isOwned(userId, gameId);
}

/**
 * Grants ownership of all games in an order to the user.
 * Called from paymentService.markPaymentVerified after a successful payment.
 * Idempotent — ON CONFLICT DO NOTHING prevents duplicate rows.
 *
 * @param {number|string} userId
 * @param {number}        orderId
 * @param {object[]}      orderItems  rows from order_items
 */
async function grantOwnershipForOrder(userId, orderId, orderItems) {
  if (!orderItems || orderItems.length === 0) return [];

  const entries = orderItems
    .filter((item) => item.game_id != null)
    .map((item) => ({
      userId,
      gameId:       item.game_id,
      orderId,
      gameTitle:    item.game_title,
      purchaseDate: new Date().toISOString(),
    }));

  if (entries.length === 0) return [];

  return libraryRepository.bulkCreate(entries);
}

/**
 * Asserts a user does NOT already own a game.
 * Used in cart and checkout to prevent re-purchase.
 */
async function assertNotOwned(userId, gameId, gameTitle) {
  const owned = await libraryRepository.isOwned(userId, gameId);
  if (owned) {
    throw AppError.conflict(
      `You already own "${gameTitle}". It is in your library.`,
      'GAME_ALREADY_OWNED'
    );
  }
}

module.exports = {
  getLibrary,
  isGameOwned,
  grantOwnershipForOrder,
  assertNotOwned,
};
