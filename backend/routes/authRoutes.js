const express = require('express');
const router = express.Router();

const authController = require('../controller/authController');

// 🔥 SAFETY CHECK (prevents "handler must be function" crash)
if (typeof authController.register !== 'function') {
	console.error('register is not a function in authController');
}

if (typeof authController.login !== 'function') {
	console.error('login is not a function in authController');
}

if (typeof authController.createAdmin !== 'function') {
	console.error('createAdmin is not a function in authController');
}

if (typeof authController.uploadAvatar !== 'function') {
	console.error('uploadAvatar is not a function in authController');
}

/* -------------------------
   AUTH ROUTES
--------------------------*/
router.post('/register', authController.register);
router.post('/login', authController.login);

// temporary admin creation route
router.post('/admin/create', authController.createAdmin);

module.exports = router;