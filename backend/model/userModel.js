const { pool } = require('../database/db');

const USER_SELECT_FIELDS =
	'uid, uid AS user_id, username, email, status, avatar, created_at, updated_at';

const AUTH_SELECT_FIELDS =
	'uid, uid AS user_id, username, email, password, status, avatar, created_at, updated_at';

/* ---------------- USERS ---------------- */

async function getAllUsers() {
	const result = await pool.query(
		`SELECT ${USER_SELECT_FIELDS} FROM users ORDER BY uid DESC`
	);
	return result.rows;
}

async function getUserById(userId) {
	const result = await pool.query(
		`SELECT ${USER_SELECT_FIELDS} FROM users WHERE uid = $1`,
		[userId]
	);
	return result.rows[0] || null;
}

async function getUserByEmailOrUsername(email, username) {
	const result = await pool.query(
		`SELECT ${USER_SELECT_FIELDS}
		 FROM users
		 WHERE LOWER(email) = LOWER($1)
		 OR LOWER(username) = LOWER($2)
		 LIMIT 1`,
		[email, username]
	);

	return result.rows[0] || null;
}

async function findUserByLoginIdentifier(identifier) {
	const result = await pool.query(
		`SELECT ${AUTH_SELECT_FIELDS}
		 FROM users
		 WHERE LOWER(email) = LOWER($1)
		 OR LOWER(username) = LOWER($1)
		 LIMIT 1`,
		[identifier]
	);

	return result.rows[0] || null;
}

async function createUser({ username, email, password, status = 'active' }) {
	const result = await pool.query(
		`INSERT INTO users (username, email, password, status)
		 VALUES ($1, $2, $3, $4)
		 RETURNING ${USER_SELECT_FIELDS}`,
		[username, email, password, status]
	);

	return result.rows[0];
}

async function updateUser(userId, data) {
	const existing = await getUserById(userId);

	if (!existing) {
		return null;
	}

	if (data.password) {
		const result = await pool.query(
			`UPDATE users
			 SET username=$1,
			     email=$2,
			     password=$3,
			     status=$4,
			     updated_at=NOW()
			 WHERE uid=$5
			 RETURNING ${USER_SELECT_FIELDS}`,
			[
				data.username || existing.username,
				data.email || existing.email,
				data.password,
				data.status || existing.status,
				userId,
			]
		);

		return result.rows[0] || null;
	}

	const result = await pool.query(
		`UPDATE users
		 SET username=$1,
		     email=$2,
		     status=$3,
		     updated_at=NOW()
		 WHERE uid=$4
		 RETURNING ${USER_SELECT_FIELDS}`,
		[
			data.username || existing.username,
			data.email || existing.email,
			data.status || existing.status,
			userId,
		]
	);

	return result.rows[0] || null;
}

async function deleteUser(userId) {
	const result = await pool.query(
		`DELETE FROM users WHERE uid=$1`,
		[userId]
	);

	return result.rowCount > 0;
}

/* ---------------- AVATAR ---------------- */

async function updateAvatar(userId, avatar) {
	const result = await pool.query(
		`UPDATE users SET avatar=$1, updated_at=NOW()
		 WHERE uid=$2
		 RETURNING ${USER_SELECT_FIELDS}`,
		[avatar, userId]
	);

	return result.rows[0];
}

module.exports = {
	getAllUsers,
	getUserById,
	getUserByEmailOrUsername,
	findUserByLoginIdentifier,
	createUser,
	updateUser,
	deleteUser,
	updateAvatar,
};