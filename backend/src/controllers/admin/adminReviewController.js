'use strict';

const reviewService    = require('../../services/reviewService');
const { asyncHandler } = require('../../utils/asyncHandler');
const { sendSuccess }  = require('../../utils/responseFormatter');
const { HTTP_STATUS }  = require('../../constants/httpStatus');
const { AppError }     = require('../../utils/AppError');

const listReviews = asyncHandler(async (req, res) => {
  const page      = Math.max(1, parseInt(req.query.page  ?? '1',  10));
  const limit     = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
  const isVisible = req.query.visible !== undefined
    ? req.query.visible === 'true'
    : undefined;

  const result = await reviewService.listReviewsAdmin({ page, limit, isVisible });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Reviews retrieved',
    data:       result,
  });
});

const moderateReview = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) throw AppError.badRequest('Invalid review ID', 'INVALID_ID');

  const isVisible = req.body.is_visible;
  if (typeof isVisible !== 'boolean') {
    throw AppError.badRequest('is_visible must be a boolean', 'INVALID_VALUE');
  }

  const review = await reviewService.toggleReviewVisibility(id, isVisible);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    `Review ${isVisible ? 'made visible' : 'hidden'}`,
    data:       { review },
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id || isNaN(id)) throw AppError.badRequest('Invalid review ID', 'INVALID_ID');

  await reviewService.deleteReview(null, id, true);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Review deleted',
    data:       null,
  });
});

module.exports = { listReviews, moderateReview, deleteReview };
