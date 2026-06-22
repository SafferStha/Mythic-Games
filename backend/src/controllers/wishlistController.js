'use strict';

const wishlistService            = require('../services/wishlistService');
const { asyncHandler }           = require('../utils/asyncHandler');
const { sendSuccess }            = require('../utils/responseFormatter');
const { HTTP_STATUS }            = require('../constants/httpStatus');

const getWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.getWishlist(req.user.uid);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Wishlist retrieved',
    data:       result,
  });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.body.game_id, 10);
  if (!gameId || isNaN(gameId)) {
    const { AppError } = require('../utils/AppError');
    throw AppError.badRequest('game_id must be a positive integer', 'INVALID_GAME_ID');
  }

  const result = await wishlistService.addToWishlist(req.user.uid, gameId);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message:    'Added to wishlist',
    data:       result,
  });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (!gameId || isNaN(gameId)) {
    const { AppError } = require('../utils/AppError');
    throw AppError.badRequest('Invalid game ID', 'INVALID_GAME_ID');
  }

  const result = await wishlistService.removeFromWishlist(req.user.uid, gameId);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Removed from wishlist',
    data:       result,
  });
});

const moveToCart = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (!gameId || isNaN(gameId)) {
    const { AppError } = require('../utils/AppError');
    throw AppError.badRequest('Invalid game ID', 'INVALID_GAME_ID');
  }

  const result = await wishlistService.moveToCart(req.user.uid, gameId);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    `"${result.game_title}" moved to cart`,
    data:       result,
  });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
