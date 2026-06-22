'use strict';

const { Router }       = require('express');
const reviewCtrl       = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

// Public — read reviews for any game
router.get('/games/:gameId/reviews', reviewCtrl.getGameReviews);

// Protected — create/edit/delete own review
router.post  ('/games/:gameId/reviews',      authenticate, reviewCtrl.createReview);
router.patch ('/reviews/:reviewId',          authenticate, reviewCtrl.updateReview);
router.delete('/reviews/:reviewId',          authenticate, reviewCtrl.deleteReview);
router.get   ('/games/:gameId/my-review',    authenticate, reviewCtrl.getMyReviewForGame);

module.exports = router;
