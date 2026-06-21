"use strict";

require("dotenv").config();

const app = require("./src/app");
const {
  runMigrations,
  getConnectionInfo,
} = require("./src/database/migrations");
const { logger } = require("./src/utils/logger");
const env = require("./src/config/env");

async function startServer() {
  try {
    await runMigrations();

    const { database, host, port: dbPort } = await getConnectionInfo();
    logger.info(
      `Connected to PostgreSQL "${database}" at ${host ?? "localhost"}:${dbPort ?? 5432}`,
    );

    app.listen(env.PORT, () => {
      logger.info(`Server running  →  http://localhost:${env.PORT}`);
      logger.info(`Environment     →  ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Server failed to start", { error: error.message });
    process.exit(1);
  }
}

startServer();
