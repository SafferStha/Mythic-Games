const { Pool } = require('pg');

require('dotenv').config();

function buildConnectionOptions() {
	const databaseUrl = process.env.DATABASE_URL?.trim();

	if (databaseUrl) {
		return {
			connectionString: databaseUrl,
			ssl:
				process.env.DB_SSL === 'true'
					? { rejectUnauthorized: false }
					: false,
		};
	}

	const databaseName = process.env.DB_NAME?.trim();

	if (!databaseName) {
		throw new Error(
			'PostgreSQL configuration is missing. Set DATABASE_URL or DB_NAME in backend/.env.'
		);
	}

	return {
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: databaseName,
		password: process.env.DB_PASSWORD,
		port: Number(process.env.DB_PORT || 5432),
		ssl:
			process.env.DB_SSL === 'true'
				? { rejectUnauthorized: false }
				: false,
	};
}

const connectionOptions = buildConnectionOptions();

const pool = new Pool(connectionOptions);

async function initializeDatabase() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			full_name VARCHAR(120) NOT NULL,
			username VARCHAR(60) NOT NULL UNIQUE,
			email VARCHAR(120) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);
}

async function getConnectionInfo() {
	const result = await pool.query(
		'SELECT current_database() AS database, inet_server_addr() AS host, inet_server_port() AS port'
	);

	return result.rows[0];
}

module.exports = {
	pool,
	initializeDatabase,
	getConnectionInfo,
};
