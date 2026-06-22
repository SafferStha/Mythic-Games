'use strict';

const reviewRepository  = require('../repositories/reviewRepository');
const libraryRepository = require('../repositories/libraryRepository');
const gameRepository    = require('../repositories/gameRepository');
const { AppError }      = require('../utils/AppError');

async function getGameReviews(gameId, { page, limit } = {}) {
  const game = await gameRepository.findById(gameId);
  if (!game) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');

  const { reviews, total } = await reviewRepository.findByGameId(gameId, { page, limit });
  const stats              = await reviewRepository.getGameAverageRating(gameId);

  return { reviews, total, stats, game: { id: game.id, title: game.title } };
}

async function createReview(userId, gameId, { rating, reviewText }) {
  // Verified purchaser check
  const owned = await libraryRepository.isOwned(userId, gameId);
  if (!owned) {
    throw AppError.forbidden(
      'You must own this game to leave a review',
      'NOT_PURCHASED'
    );
  }

  const existing = await reviewRepository.findByUserAndGame(userId, gameId);
  if (existing) {
    throw AppError.conflict('You have already reviewed this game', 'REVIEW_ALREADY_EXISTS');
  }

  const game = await gameRepository.findById(gameId);
  if (!game) throw AppError.notFound('Game not found', 'GAME_NOT_FOUND');

  const review = await reviewRepository.create({ userId, gameId, rating, reviewText });
  return { review, username: undefined };
}

async function updateReview(userId, reviewId, { rating, reviewText }) {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw AppError.notFound('Review not found', 'REVIEW_NOT_FOUND');

  if (String(review.user_id) !== String(userId)) {
    throw AppError.forbidden('You can only edit your own reviews', 'REVIEW_ACCESS_DENIED');
  }

  return reviewRepository.update(reviewId, { rating, reviewText });
}

async function deleteReview(userId, reviewId, isAdmin = false) {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw AppError.notFound('Review not found', 'REVIEW_NOT_FOUND');

  if (!isAdmin && String(review.user_id) !== String(userId)) {
    throw AppError.forbidden('You can only delete your own reviews', 'REVIEW_ACCESS_DENIED');
  }

  return reviewRepository.remove(reviewId);
}

async function getUserReviewForGame(userId, gameId) {
  return reviewRepository.findByUserAndGame(userId, gameId);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

async function listReviewsAdmin({ page, limit, isVisible } = {}) {
  return reviewRepository.findAllAdmin({ page, limit, isVisible });
}

async function toggleReviewVisibility(reviewId, isVisible) {
  const review = await reviewRepository.findById(reviewId);
  if (!review) throw AppError.notFound('Review not found', 'REVIEW_NOT_FOUND');

  return reviewRepository.setVisibility(reviewId, isVisible);
}

module.exports = {
  getGameReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviewForGame,
  listReviewsAdmin,
  toggleReviewVisibility,
};
