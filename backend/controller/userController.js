const userModel = require('../model/userModel');

function isBlank(value) {
	return !value || !String(value).trim();
}

function validateUserPayload(payload) {
	const username = payload.username;
	const email = payload.email;
	const password = payload.password;
	const status = payload.status;

	if (isBlank(username) || isBlank(email) || isBlank(password)) {
		return null;
	}

	return {
		username: String(username).trim(),
		email: String(email).trim().toLowerCase(),
		password: String(password),
		status: isBlank(status) ? 'active' : String(status).trim().toLowerCase(),
	};
}

async function listUsers(req, res, next) {
	try {
		const users = await userModel.getAllUsers();
		res.json({ success: true, data: users });
	} catch (error) {
		next(error);
	}
}

async function getUser(req, res, next) {
	try {
		const user = await userModel.getUserById(req.params.id);

		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		res.json({ success: true, data: user });
	} catch (error) {
		next(error);
	}
}

async function createUser(req, res, next) {
	try {
		const userPayload = validateUserPayload(req.body);

		if (!userPayload) {
			return res.status(400).json({
				success: false,
				message: 'username, email, and password are required',
			});
		}

		const existingUser = await userModel.getUserByEmailOrUsername(
			userPayload.email,
			userPayload.username
		);

		if (existingUser) {
			return res.status(409).json({
				success: false,
				message: 'A user with that email or username already exists',
			});
		}

		const user = await userModel.createUser(userPayload);
		res.status(201).json({ success: true, data: user });
	} catch (error) {
		next(error);
	}
}

async function updateUser(req, res, next) {
	try {
		const userPayload = validateUserPayload(req.body);

		if (!userPayload) {
			return res.status(400).json({
				success: false,
				message: 'username, email, and password are required',
			});
		}

		const existingUser = await userModel.getUserByEmailOrUsername(
			userPayload.email,
			userPayload.username
		);

		if (existingUser && String(existingUser.uid ?? existingUser.user_id) !== String(req.params.id)) {
			return res.status(409).json({
				success: false,
				message: 'A user with that email or username already exists',
			});
		}

		const user = await userModel.updateUser(req.params.id, userPayload);

		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		res.json({ success: true, data: user });
	} catch (error) {
		next(error);
	}
}

async function deleteUser(req, res, next) {
	try {
		const removed = await userModel.deleteUser(req.params.id);

		if (!removed) {
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		res.json({ success: true, message: 'User deleted successfully' });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	listUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
};
