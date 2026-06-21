'use strict';

const { Router }       = require('express');
const authController   = require('../controllers/authController');
const { authLimiter }  = require('../middlewares/rateLimiter');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();

// Rate-limit only mutating / credential endpoints
router.post('/register', authLimiter, authController.register);
router.post('/login',    authLimiter, authController.login);
router.post('/refresh',              authController.refresh);
router.post('/logout',   authenticate, authController.logout);

module.exports = router;
