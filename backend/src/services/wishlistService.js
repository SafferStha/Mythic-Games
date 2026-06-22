'use strict';

const wishlistRepository = require('../repositories/wishlistRepository');
const gameRepository     = require('../repositories/gameRepository');
const cartRepository     = require('../repositories/cartRepository');
const cartItemRepository = require('../repositories/cartItemRepository');
const { AppError }       = require('../utils/AppError');
const { GAME_STATUS }    = require('../constants/gameStatus');
const { effectivePrice } = require('../utils/cartCalculator');

async function getWishlist(userId) {
  const wishlist = await wishlistRepository.findByUserId(userId);
  if (!wishlist) return { items: [], total: 0 };

  const items = await wishlistRepository.getItems(wishlist.id);
  return { items, total: items.length };
}

async function addToWishlist(userId, gameId) {
  const game = await gameRepository.findById(gameId);
  if (!game) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');

  if (game.status === GAME_STATUS.INACTIVE) {
    throw AppError.badRequest('This game is not available', 'GAME_UNAVAILABLE');
  }

  const wishlist = await wishlistRepository.findOrCreate(userId);

  const existing = await wishlistRepository.findItem(wishlist.id, gameId);
  if (existing) {
    throw AppError.conflict('Game is already in your wishlist', 'ALREADY_IN_WISHLIST');
  }

  await wishlistRepository.addItem(wishlist.id, gameId);

  const items = await wishlistRepository.getItems(wishlist.id);
  return { items, total: items.length };
}

async function removeFromWishlist(userId, gameId) {
  const wishlist = await wishlistRepository.findByUserId(userId);
  if (!wishlist) throw AppError.notFound('Wishlist not found', 'WISHLIST_NOT_FOUND');

  const removed = await wishlistRepository.removeItemByGameId(wishlist.id, gameId);
  if (!removed) throw AppError.notFound('Game not found in wishlist', 'WISHLIST_ITEM_NOT_FOUND');

  const items = await wishlistRepository.getItems(wishlist.id);
  return { items, total: items.length };
}

/**
 * Moves a game from the wishlist to the cart.
 * Removes from wishlist, adds to cart (if not already there).
 */
async function moveToCart(userId, gameId) {
  const wishlist = await wishlistRepository.findByUserId(userId);
  if (!wishlist) throw AppError.notFound('Wishlist not found', 'WISHLIST_NOT_FOUND');

  const item = await wishlistRepository.findItem(wishlist.id, gameId);
  if (!item) throw AppError.notFound('Game not in wishlist', 'WISHLIST_ITEM_NOT_FOUND');

  const game = await gameRepository.findById(gameId);
  if (!game) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');

  if (game.status !== GAME_STATUS.ACTIVE) {
    throw AppError.badRequest(
      `"${game.title}" is not available for purchase`,
      'GAME_UNAVAILABLE'
    );
  }

  if (game.stock < 1) {
    throw AppError.badRequest(`"${game.title}" is out of stock`, 'OUT_OF_STOCK');
  }

  // Add to cart
  const cart = await cartRepository.findOrCreate(userId);
  const existingCartItem = await cartItemRepository.findByCartAndGame(cart.id, gameId);

  if (!existingCartItem) {
    await cartItemRepository.create({
      cartId:    cart.id,
      gameId:    game.id,
      quantity:  1,
      unitPrice: effectivePrice(game),
    });
  }

  // Remove from wishlist
  await wishlistRepository.removeItemByGameId(wishlist.id, gameId);

  const items = await wishlistRepository.getItems(wishlist.id);
  return { moved: true, game_title: game.title, items, total: items.length };
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
};
