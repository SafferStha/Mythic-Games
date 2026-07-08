const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('../model/adminModel');
const userModel = require('../model/userModel');
const otpModel = require('../model/otpModel');
const emailService = require('../service/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_mythic_games_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


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
		profile_image: user.profile_image,
		bio: user.bio,
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
				const sanitizedAdmin = sanitizeAdmin(admin);
				const token = jwt.sign(
					{ uid: admin.admin_id, email: admin.email, role: 'admin' },
					JWT_SECRET,
					{ expiresIn: JWT_EXPIRES_IN }
				);
				return res.json({
					success: true,
					message: 'Login successful',
					data: {
						...sanitizedAdmin,
						token,
					},
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
				const sanitizedUser = sanitizeUser(user);
				const token = jwt.sign(
					{ uid: user.uid, email: user.email, role: 'user' },
					JWT_SECRET,
					{ expiresIn: JWT_EXPIRES_IN }
				);
				return res.json({
					success: true,
					message: 'Login successful',
					data: {
						...sanitizedUser,
						token,
					},
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

async function forgotPassword(req, res, next) {
	try {
		const { email } = req.body;

		if (!email || !email.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Email is required',
			});
		}

		const normalizedEmail = email.trim().toLowerCase();

		// Check if user exists
		const user = await userModel.getUserByEmailOrUsername(normalizedEmail, '');
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'No user account found with this email address',
			});
		}

		// Generate 6-digit OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

		// Save OTP to DB
		await otpModel.saveOTP(normalizedEmail, otp, expiresAt);

		// Send OTP via Email
		await emailService.sendOTPEmail(normalizedEmail, otp);

		return res.status(200).json({
			success: true,
			message: 'OTP verification code sent to your email',
		});
	} catch (error) {
		next(error);
	}
}

async function verifyOtp(req, res, next) {
	try {
		const { email, otp } = req.body;

		if (!email || !email.trim() || !otp || !otp.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Email and OTP code are required',
			});
		}

		const normalizedEmail = email.trim().toLowerCase();
		const validOtp = await otpModel.getValidOTP(normalizedEmail, otp.trim());

		if (!validOtp) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired OTP code',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'OTP verified successfully',
		});
	} catch (error) {
		next(error);
	}
}

async function resetPassword(req, res, next) {
	try {
		const { email, otp, newPassword } = req.body;

		if (!email || !email.trim() || !otp || !otp.trim() || !newPassword) {
			return res.status(400).json({
				success: false,
				message: 'Email, OTP code, and new password are required',
			});
		}

		const normalizedEmail = email.trim().toLowerCase();
		
		// Verify OTP again before resetting password
		const validOtp = await otpModel.getValidOTP(normalizedEmail, otp.trim());
		if (!validOtp) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired OTP code. Please request a new code.',
			});
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update in database
		const updatedUser = await userModel.updateUserPassword(normalizedEmail, hashedPassword);
		if (!updatedUser) {
			return res.status(500).json({
				success: false,
				message: 'Failed to update password. Please try again.',
			});
		}

		// Consume the OTP
		await otpModel.deleteOTP(normalizedEmail);

		return res.status(200).json({
			success: true,
			message: 'Password has been reset successfully',
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	register,
	login,
	forgotPassword,
	verifyOtp,
	resetPassword,
};
