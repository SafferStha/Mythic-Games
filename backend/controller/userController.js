const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const userModel = require('../model/userModel');

/* GET ALL USERS */
async function listUsers(req, res, next) {
	try {
		const users = await userModel.getAllUsers();

		res.json({
			success: true,
			data: users,
		});
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

		res.json({
			success: true,
			data: user,
		});
	} catch (err) {
		next(err);
	}
}

/* UPDATE USER */
async function updateUser(req, res, next) {
	try {
		const updated = await userModel.updateUser(
			req.params.id,
			req.body
		);

		if (!updated) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.json({
			success: true,
			data: updated,
		});
	} catch (err) {
		next(err);
	}
}

/* DELETE USER */
async function deleteUser(req, res, next) {
	try {
		const ok = await userModel.deleteUser(
			req.params.id
		);

		if (!ok) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.json({
			success: true,
			message: 'Deleted',
		});
	} catch (err) {
		next(err);
	}
}

/* UPLOAD AVATAR */
async function uploadAvatar(req, res, next) {
	try {
		const userId = Number(req.body.userId);
		const avatar = req.file?.filename;

		if (!userId || Number.isNaN(userId) || !avatar) {
			return res.status(400).json({
				success: false,
				message: 'Invalid userId or missing avatar',
			});
		}

		const existing = await userModel.getUserById(userId);
		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const updated = await userModel.updateAvatar(
			userId,
			avatar
		);

		if (existing.avatar && existing.avatar !== avatar) {
			const oldPath = path.join('uploads', existing.avatar);
			fs.unlink(oldPath, () => {});
		}

		return res.json({
			success: true,
			data: updated,
		});
	} catch (err) {
		next(err);
	}
}

/* CHANGE PASSWORD */
async function changePassword(req, res, next) {
	try {
		const {
			userId,
			email,
			currentPassword,
			newPassword,
		} = req.body;

		if (
			!userId ||
			!email ||
			!currentPassword ||
			!newPassword
		) {
			return res.status(400).json({
				success: false,
				message: 'All fields are required',
			});
		}

		const user =
			await userModel.findUserByLoginIdentifier(
				email
			);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const passwordMatch =
			await bcrypt.compare(
				currentPassword,
				user.password
			);

		if (!passwordMatch) {
			return res.status(400).json({
				success: false,
				message:
					'Current password is incorrect',
			});
		}

		const hashedPassword =
			await bcrypt.hash(newPassword, 10);

	
		await userModel.updateUser(user.uid, {
			username: user.username,
			email: user.email,
			password: hashedPassword,
			status: user.status,
		});

		res.json({
			success: true,
			message:
				'Password updated successfully',
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
	changePassword,
};