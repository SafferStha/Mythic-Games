'use strict';

const reviewService    = require('../services/reviewService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');
const { AppError }     = require('../utils/AppError');

const getGameReviews = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (!gameId || isNaN(gameId)) throw AppError.badRequest('Invalid game ID', 'INVALID_GAME_ID');

  const page  = Math.max(1, parseInt(req.query.page  ?? '1',  10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20', 10)));

  const result = await reviewService.getGameReviews(gameId, { page, limit });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Reviews retrieved',
    data:       result,
  });
});

const createReview = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (!gameId || isNaN(gameId)) throw AppError.badRequest('Invalid game ID', 'INVALID_GAME_ID');

  const rating = parseInt(req.body.rating, 10);
  if (!rating || rating < 1 || rating > 5) {
    throw AppError.badRequest('Rating must be between 1 and 5', 'INVALID_RATING');
  }

  const reviewText = req.body.review_text?.trim() ?? null;

  const result = await reviewService.createReview(req.user.uid, gameId, { rating, reviewText });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message:    'Review submitted',
    data:       result,
  });
});

const updateReview = asyncHandler(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId, 10);
  if (!reviewId || isNaN(reviewId)) throw AppError.badRequest('Invalid review ID', 'INVALID_REVIEW_ID');

  const rating = parseInt(req.body.rating, 10);
  if (!rating || rating < 1 || rating > 5) {
    throw AppError.badRequest('Rating must be between 1 and 5', 'INVALID_RATING');
  }

  const reviewText = req.body.review_text?.trim() ?? null;

  const review = await reviewService.updateReview(req.user.uid, reviewId, { rating, reviewText });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Review updated',
    data:       { review },
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = parseInt(req.params.reviewId, 10);
  if (!reviewId || isNaN(reviewId)) throw AppError.badRequest('Invalid review ID', 'INVALID_REVIEW_ID');

  await reviewService.deleteReview(req.user.uid, reviewId, false);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Review deleted',
    data:       null,
  });
});

const getMyReviewForGame = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (!gameId || isNaN(gameId)) throw AppError.badRequest('Invalid game ID', 'INVALID_GAME_ID');

  const review = await reviewService.getUserReviewForGame(req.user.uid, gameId);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    review ? 'Your review' : 'No review found',
    data:       { review: review ?? null },
  });
});

module.exports = {
  getGameReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviewForGame,
};
