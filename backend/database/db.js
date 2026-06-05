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
        CREATE SEQUENCE IF NOT EXISTS user_uid_seq START 10000000;

        CREATE TABLE IF NOT EXISTS users (
            uid BIGINT PRIMARY KEY DEFAULT nextval('user_uid_seq'),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admins (
            admin_id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        ALTER SEQUENCE user_uid_seq OWNED BY users.uid;
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
