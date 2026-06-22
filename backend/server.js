"use strict";

require("dotenv").config();

const app = require("./src/app");
const {
  runMigrations,
  getConnectionInfo,
} = require("./src/database/migrations");
const { pool }   = require("./src/config/database");
const { logger } = require("./src/utils/logger");
const env        = require("./src/config/env");

let server;

async function startServer() {
  try {
    await runMigrations();

    const { database, host, port: dbPort } = await getConnectionInfo();
    logger.info(
      `Connected to PostgreSQL "${database}" at ${host ?? "localhost"}:${dbPort ?? 5432}`,
    );

    server = app.listen(env.PORT, () => {
      logger.info(`Server running  →  http://localhost:${env.PORT}`);
      logger.info(`Environment     →  ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Server failed to start", { error: error.message });
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Gives Docker / Kubernetes time to drain in-flight requests before the process
// exits. Without this, a SIGTERM kills the process immediately, dropping active
// connections and leaving DB transactions open.
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);

  if (!server) {
    await pool.end();
    process.exit(0);
  }

  server.close(async () => {
    logger.info("HTTP server closed — draining DB pool");
    try {
      await pool.end();
      logger.info("DB pool drained — exit 0");
      process.exit(0);
    } catch (err) {
      logger.error("Error draining DB pool", { error: err.message });
      process.exit(1);
    }
  });

  // Force-kill after 10 s if server.close() stalls (e.g. keep-alive sockets)
  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Surface uncaught errors rather than letting the process die silently
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
  process.exit(1);
});

startServer();
