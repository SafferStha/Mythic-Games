const bcrypt = require('bcryptjs');
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
		status: user.status,
		created_at: user.created_at,
		updated_at: user.updated_at,
	};
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

		const user = await userModel.findUserByLoginIdentifier(loginPayload.identifier);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email/username or password',
			});
		}

		if (user.status !== 'active') {
			return res.status(403).json({
				success: false,
				message: 'This account is inactive',
			});
		}

		const passwordMatches = user.password.startsWith('$2')
			? await bcrypt.compare(loginPayload.password, user.password)
			: user.password === loginPayload.password;

		if (!passwordMatches) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email/username or password',
			});
		}

		return res.json({
			success: true,
			message: 'Login successful',
			data: sanitizeUser(user),
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	register,
	login,
};