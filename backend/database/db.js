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

const query = (text, params) => pool.query(text, params);

async function ensureDatabaseSchema() {
	await pool.query(`
		CREATE SEQUENCE IF NOT EXISTS user_uid_seq START 10000000;

		CREATE TABLE IF NOT EXISTS users (
			uid BIGINT PRIMARY KEY DEFAULT nextval('user_uid_seq'),
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password TEXT NOT NULL,
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			profile_image TEXT,
			bio TEXT
		);

		ALTER SEQUENCE user_uid_seq OWNED BY users.uid;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
		ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

		CREATE TABLE IF NOT EXISTS admins (
			admin_id SERIAL PRIMARY KEY,
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password TEXT NOT NULL,
			role VARCHAR(20) DEFAULT 'admin',
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS games (
			id SERIAL PRIMARY KEY,
			title VARCHAR(255) UNIQUE NOT NULL,
			game_type VARCHAR(100) DEFAULT 'Base Game',
			price NUMERIC(10, 2) DEFAULT 0,
			original_price NUMERIC(10, 2) DEFAULT 0,
			discount_percent INTEGER DEFAULT 0,
			image_url TEXT,
			description TEXT,
			genres TEXT[] DEFAULT ARRAY[]::TEXT[],
			events TEXT[] DEFAULT ARRAY[]::TEXT[],
			is_upcoming BOOLEAN DEFAULT FALSE,
			is_trending BOOLEAN DEFAULT FALSE,
			is_new_release BOOLEAN DEFAULT FALSE,
			is_free BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE games ADD COLUMN IF NOT EXISTS game_type VARCHAR(100) DEFAULT 'Base Game';
		ALTER TABLE games ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2) DEFAULT 0;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS description TEXT;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT ARRAY[]::TEXT[];
		ALTER TABLE games ADD COLUMN IF NOT EXISTS events TEXT[] DEFAULT ARRAY[]::TEXT[];
		ALTER TABLE games ADD COLUMN IF NOT EXISTS is_upcoming BOOLEAN DEFAULT FALSE;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS is_new_release BOOLEAN DEFAULT FALSE;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT FALSE;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE games ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

		CREATE TABLE IF NOT EXISTS cart (
			user_id BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
			game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
			quantity INTEGER NOT NULL DEFAULT 1,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, game_id)
		);

		ALTER TABLE cart ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
		ALTER TABLE cart ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

		CREATE TABLE IF NOT EXISTS wishlist (
			user_id BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
			game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, game_id)
		);

		ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

		CREATE TABLE IF NOT EXISTS orders (
			id SERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
			game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
			amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
			order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
		ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
		ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

		CREATE TABLE IF NOT EXISTS payments (
			id SERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
			game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
			amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
			payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('esewa', 'khalti', 'free')),
			transaction_id VARCHAR(50) UNIQUE,
			payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL
		);

		ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) NOT NULL DEFAULT 0;
		ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
		ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(50);
		ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
		ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL;
		ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
		ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check
			CHECK (payment_method IN ('esewa', 'khalti', 'free'));

		CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
		CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
		CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
		CREATE INDEX IF NOT EXISTS idx_payments_game_id ON payments(game_id);

		CREATE TABLE IF NOT EXISTS library (
			id SERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
			game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
			payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
			added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			install_status VARCHAR(20) NOT NULL DEFAULT 'NOT_INSTALLED',
			UNIQUE (user_id, game_id)
		);

		ALTER TABLE library ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL;
		ALTER TABLE library ADD COLUMN IF NOT EXISTS added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE library ADD COLUMN IF NOT EXISTS install_status VARCHAR(20) NOT NULL DEFAULT 'NOT_INSTALLED';

		CREATE INDEX IF NOT EXISTS idx_library_user_id ON library(user_id);
		CREATE INDEX IF NOT EXISTS idx_library_game_id ON library(game_id);

		CREATE TABLE IF NOT EXISTS news (
			id SERIAL PRIMARY KEY,
			date_label VARCHAR(50),
			title VARCHAR(255) NOT NULL,
			excerpt TEXT,
			image_url TEXT,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE news ADD COLUMN IF NOT EXISTS date_label VARCHAR(50);
		ALTER TABLE news ADD COLUMN IF NOT EXISTS title VARCHAR(255);
		ALTER TABLE news ADD COLUMN IF NOT EXISTS excerpt TEXT;
		ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;
		ALTER TABLE news ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
		ALTER TABLE news ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

		CREATE TABLE IF NOT EXISTS otp_verifications (
			id SERIAL PRIMARY KEY,
			email VARCHAR(100) NOT NULL,
			otp_code VARCHAR(6) NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
		CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);
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
	query,
	ensureDatabaseSchema,
	initializeDatabase: ensureDatabaseSchema,
	getConnectionInfo,
};
