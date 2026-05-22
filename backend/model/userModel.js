const { pool } = require('../database/db');

async function getAllUsers() {
	const result = await pool.query(
		'SELECT id, full_name, username, email, created_at, updated_at FROM users ORDER BY id DESC'
	);

	return result.rows;
}

async function getUserById(id) {
	const result = await pool.query(
		'SELECT id, full_name, username, email, created_at, updated_at FROM users WHERE id = $1',
		[id]
	);

	return result.rows[0] || null;
}

async function getUserByEmailOrUsername(email, username) {
	const result = await pool.query(
		'SELECT id, full_name, username, email FROM users WHERE email = $1 OR username = $2 LIMIT 1',
		[email, username]
	);

	return result.rows[0] || null;
}

async function createUser({ fullName, username, email, password }) {
	const result = await pool.query(
		`
			INSERT INTO users (full_name, username, email, password)
			VALUES ($1, $2, $3, $4)
			RETURNING id, full_name, username, email, created_at, updated_at
		`,
		[fullName, username, email, password]
	);

	return result.rows[0];
}

async function updateUser(id, { fullName, username, email, password }) {
	const result = await pool.query(
		`
			UPDATE users
			SET full_name = $1,
					username = $2,
					email = $3,
					password = $4,
					updated_at = NOW()
			WHERE id = $5
			RETURNING id, full_name, username, email, created_at, updated_at
		`,
		[fullName, username, email, password, id]
	);

	return result.rows[0] || null;
}

async function deleteUser(id) {
	const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

	return result.rowCount > 0;
}

module.exports = {
	getAllUsers,
	getUserById,
	getUserByEmailOrUsername,
	createUser,
	updateUser,
	deleteUser,
};
