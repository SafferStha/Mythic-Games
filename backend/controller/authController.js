const bcrypt = require('bcryptjs');
const path = require('path');

const userModel = require('../model/userModel');
const adminModel = require('../model/adminModel');

function isEmpty(v) {
	return !v || !String(v).trim();
}

/* -------------------------
   NORMALIZE INPUT
--------------------------*/
function normalizeRegister(body) {
	const { username, email, password } = body;

	if (isEmpty(username) || isEmpty(email) || isEmpty(password)) {
		return null;
	}

	return {
		username: username.trim(),
		email: email.trim().toLowerCase(),
		password,
	};
}

function normalizeLogin(body) {
	const identifier = body.identifier || body.email || body.username;
	const password = body.password;

	if (isEmpty(identifier) || isEmpty(password)) return null;

	return {
		identifier: identifier.trim().toLowerCase(),
		password,
	};
}

/* -------------------------
   CLEAN OUTPUT
--------------------------*/
function cleanUser(u) {
	return {
		uid: u.uid,
		user_id: u.uid,
		username: u.username,
		email: u.email,
		role: 'user',
		status: u.status,
		avatar: u.avatar,
	};
}

function cleanAdmin(a) {
	return {
		id: a.admin_id,
		username: a.username,
		email: a.email,
		role: 'admin',
		status: a.status,
	};
}

/* -------------------------
   REGISTER (USER + ADMIN)
--------------------------*/
async function register(req, res, next) {
	try {
		console.log("REGISTER BODY:", req.body);

		const data = normalizeRegister(req.body);

		if (!data) {
			return res.status(400).json({
				success: false,
				message: 'username, email, password required',
			});
		}

		/* -------------------------
		   STEP 5 (FIXED SAFE CHECK)
		--------------------------*/
		let userExists = null;
		let adminExists = null;

		try {
			userExists = await userModel.getUserByEmailOrUsername(
				data.email,
				data.username
			);
		} catch (e) {
			console.error("🔥 USER CHECK ERROR:", e.message);
			return res.status(500).json({
				success: false,
				message: "User lookup failed",
			});
		}

		try {
			adminExists = await adminModel.getAdminByEmailOrUsername(
				data.email,
				data.username
			);
		} catch (e) {
			console.error("🔥 ADMIN CHECK ERROR:", e.message);
			return res.status(500).json({
				success: false,
				message: "Admin lookup failed",
			});
		}

		if (userExists || adminExists) {
			return res.status(409).json({
				success: false,
				message: 'Account already exists',
			});
		}

		/* -------------------------
		   CREATE USER / ADMIN
		--------------------------*/
		const hash = await bcrypt.hash(data.password, 10);

		// ADMIN
		if (data.email.endsWith('@mythic.com')) {
			const admin = await adminModel.createAdmin({
				username: data.username,
				email: data.email,
				password: hash,
			});

			return res.status(201).json({
				success: true,
				message: 'Admin registered successfully',
				data: cleanAdmin(admin),
			});
		}

		// USER
		const user = await userModel.createUser({
			username: data.username,
			email: data.email,
			password: hash,
		});

		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			data: cleanUser(user),
		});

	} catch (err) {
		console.error("🔥 REGISTER ERROR:", err);
		next(err);
	}
}

/* -------------------------
   LOGIN
--------------------------*/
async function login(req, res, next) {
	try {
		const data = normalizeLogin(req.body);

		if (!data) {
			return res.status(400).json({
				success: false,
				message: 'identifier and password required',
			});
		}

		const [user, admin] = await Promise.all([
			userModel.findUserByLoginIdentifier(data.identifier),
			adminModel.findAdminByLoginIdentifier(data.identifier),
		]);

		// ADMIN
		if (admin) {
			const ok = await bcrypt.compare(data.password, admin.password);

			if (ok) {
				return res.json({
					success: true,
					message: 'Admin login successful',
					data: cleanAdmin(admin),
				});
			}
		}

		// USER
		if (user) {
			const ok = await bcrypt.compare(data.password, user.password);

			if (ok) {
				return res.json({
					success: true,
					message: 'User login successful',
					data: cleanUser(user),
				});
			}
		}

		return res.status(401).json({
			success: false,
			message: 'Invalid credentials',
		});

	} catch (err) {
		console.error("🔥 LOGIN ERROR:", err);
		next(err);
	}
}

/* -------------------------
   AVATAR UPLOAD
--------------------------*/
async function uploadAvatar(req, res, next) {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'No file uploaded',
			});
		}

		const { userId } = req.body;
		const avatar = req.file.filename;

		const updatedUser = await userModel.updateAvatar(userId, avatar);

		return res.json({
			success: true,
			message: 'Avatar updated successfully',
			data: cleanUser(updatedUser),
		});

	} catch (err) {
		console.error("🔥 AVATAR ERROR:", err);
		next(err);
	}
}

/* -------------------------
   CREATE ADMIN (TEST ROUTE)
--------------------------*/
const createAdmin = async (req, res, next) => {
	try {
		const { username, email, password } = req.body;

		if (!username || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'All fields required',
			});
		}

		return res.json({
			success: true,
			message: 'Admin route working (placeholder)',
		});

	} catch (err) {
		console.error("🔥 CREATE ADMIN ERROR:", err);
		next(err);
	}
};

module.exports = {
	register,
	login,
	createAdmin,
	uploadAvatar
};