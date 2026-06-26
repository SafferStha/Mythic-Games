const bcrypt = require('bcrypt');
const adminModel = require('../model/adminModel');
const userModel = require('../model/userModel');

function isBlank(value) {
	return !value || !String(value).trim();
}

function normalizeRegisterPayload(payload) {
	const username = payload.username;
	const email = payload.email;
	const password = payload.password;

	if (isBlank(username) || isBlank(email) || isBlank(password)) {
		return null;
	}

	return {
		username: String(username).trim(),
		email: String(email).trim().toLowerCase(),
		password: String(password),
	};
}

function normalizeLoginPayload(payload) {
	const identifier = payload.identifier ?? payload.email ?? payload.username;
	const password = payload.password;

	if (isBlank(identifier) || isBlank(password)) {
		return null;
	}

	return {
		identifier: String(identifier).trim().toLowerCase(),
		password: String(password),
	};
}

function sanitizeUser(user) {
	if (!user) {
		return null;
	}

	return {
		uid: user.uid,
		user_id: user.user_id,
		username: user.username,
		email: user.email,
		role: user.role || 'user',
		status: user.status,
		created_at: user.created_at,
		updated_at: user.updated_at,
	};
}

function sanitizeAdmin(admin) {
	if (!admin) {
		return null;
	}

	return {
		admin_id: admin.admin_id,
		uid: admin.uid,
		user_id: admin.user_id,
		username: admin.username,
		email: admin.email,
		role: admin.role || 'admin',
		status: admin.status,
		created_at: admin.created_at,
 	};
}

async function comparePassword(password, storedPassword) {
	return storedPassword?.startsWith('$2')
		? bcrypt.compare(password, storedPassword)
		: storedPassword === password;
}

async function register(req, res, next) {
	try {
		const userPayload = normalizeRegisterPayload(req.body);

		if (!userPayload) {
			return res.status(400).json({
				success: false,
				message: 'username, email, and password are required',
			});
		}

		const [existingUser, existingAdmin] = await Promise.all([
			userModel.getUserByEmailOrUsername(userPayload.email, userPayload.username),
			adminModel.getAdminByEmailOrUsername(userPayload.email, userPayload.username),
		]);

		if (existingUser || existingAdmin) {
			return res.status(409).json({
				success: false,
				message: 'An account with that email or username already exists',
			});
		}

		const hashedPassword = await bcrypt.hash(userPayload.password, 10);
		const user = await userModel.createUser({
			...userPayload,
			password: hashedPassword,
		});

		return res.status(201).json({
			success: true,
			message: 'Registration successful',
			data: sanitizeUser(user),
		});
	} catch (error) {
		next(error);
	}
}

async function login(req, res, next) {
	try {
		const loginPayload = normalizeLoginPayload(req.body);

		if (!loginPayload) {
			return res.status(400).json({
				success: false,
				message: 'email/username and password are required',
			});
		}

		const [admin, user] = await Promise.all([
			adminModel.findAdminByLoginIdentifier(loginPayload.identifier),
			userModel.findUserByLoginIdentifier(loginPayload.identifier),
		]);

		if (!admin && !user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email/username or password',
			});
		}

		if (admin) {
			if (admin.status !== 'active') {
				return res.status(403).json({
					success: false,
					message: 'This admin account is inactive',
				});
			}

			if (await comparePassword(loginPayload.password, admin.password)) {
				return res.json({
					success: true,
					message: 'Login successful',
					data: sanitizeAdmin(admin),
				});
			}
		}

		if (user) {
			if (user.status !== 'active') {
				return res.status(403).json({
					success: false,
					message: 'This account is inactive',
				});
			}

			if (await comparePassword(loginPayload.password, user.password)) {
				return res.json({
					success: true,
					message: 'Login successful',
					data: sanitizeUser(user),
				});
			}
		}

		return res.status(401).json({
			success: false,
			message: 'Invalid email/username or password',
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	register,
	login,
};
