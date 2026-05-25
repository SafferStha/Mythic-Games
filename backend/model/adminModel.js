const { pool } = require('../database/db');

const ADMIN_SELECT_FIELDS = 'admin_id, admin_id AS uid, admin_id AS user_id, username, email, role, status, created_at';
const ADMIN_AUTH_SELECT_FIELDS = `${ADMIN_SELECT_FIELDS}, password`;

async function getAdminByEmailOrUsername(email, username) {
	const result = await pool.query(
		`SELECT ${ADMIN_SELECT_FIELDS} FROM admins WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2) LIMIT 1`,
		[email, username]
	);

	return result.rows[0] || null;
}

async function findAdminByLoginIdentifier(identifier) {
	const result = await pool.query(
		`SELECT ${ADMIN_AUTH_SELECT_FIELDS} FROM admins WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) LIMIT 1`,
		[identifier]
	);

	return result.rows[0] || null;
}

module.exports = {
	getAdminByEmailOrUsername,
	findAdminByLoginIdentifier,
};