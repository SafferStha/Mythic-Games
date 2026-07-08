const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_mythic_games_jwt_key_2026';

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'Access token required. Please sign in.',
		});
	}

	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({
				success: false,
				message: 'Invalid or expired session. Please sign in again.',
			});
		}

		req.user = decoded;
		next();
	});
}

function requireAdmin(req, res, next) {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			message: 'Authentication required.',
		});
	}

	if (req.user.role !== 'admin') {
		return res.status(403).json({
			success: false,
			message: 'Forbidden. Admin access required.',
		});
	}

	next();
}

module.exports = {
	authenticateToken,
	requireAdmin,
};
