const userModel = require('../model/userModel');

/* GET ALL USERS */
async function listUsers(req, res, next) {
	try {
		const users = await userModel.getAllUsers();
		res.json({ success: true, data: users });
	} catch (err) {
		next(err);
	}
}

/* GET USER */
async function getUser(req, res, next) {
	try {
		const user = await userModel.getUserById(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.json({ success: true, data: user });
	} catch (err) {
		next(err);
	}
}

/* UPDATE USER */
async function updateUser(req, res, next) {
	try {
		const updated = await userModel.updateUser(req.params.id, req.body);

		if (!updated) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.json({ success: true, data: updated });
	} catch (err) {
		next(err);
	}
}

/* DELETE USER */
async function deleteUser(req, res, next) {
	try {
		const ok = await userModel.deleteUser(req.params.id);

		if (!ok) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.json({ success: true, message: 'Deleted' });
	} catch (err) {
		next(err);
	}
}

/* UPLOAD AVATAR */
async function uploadAvatar(req, res, next) {
	try {
		const userId = req.body.userId;
		const avatar = req.file?.filename;

		if (!userId || !avatar) {
			return res.status(400).json({
				success: false,
				message: 'Missing data',
			});
		}

		const updated = await userModel.updateAvatar(userId, avatar);

		res.json({
			success: true,
			data: updated,
		});
	} catch (err) {
		next(err);
	}
}

module.exports = {
	listUsers,
	getUser,
	updateUser,
	deleteUser,
	uploadAvatar,
};