const express = require('express');
const router = express.Router();
const multer = require('multer');

const userController = require('../controller/userController');

/* MULTER */
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		cb(
			null,
			Date.now() +
				'-' +
				file.originalname
		);
	},
});

const upload = multer({ storage });

/* USER ROUTES */
router.get('/', userController.listUsers);

router.get('/:id', userController.getUser);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

/* AVATAR */
router.post(
	'/upload-avatar',
	upload.single('avatar'),
	userController.uploadAvatar
);

/* CHANGE PASSWORD */
router.post(
	'/change-password',
	userController.changePassword
);

module.exports = router;