'use strict';

const path      = require('path');
const winston   = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
const isProd   = process.env.NODE_ENV === 'production';
const isTest   = process.env.NODE_ENV === 'test';

// ── Formats ───────────────────────────────────────────────────────────────────

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
  })
);

// ── File transports ───────────────────────────────────────────────────────────

function rotatingFile(filename, level) {
  return new DailyRotateFile({
    dirname:        LOGS_DIR,
    filename:       `${filename}-%DATE%.log`,
    datePattern:    'YYYY-MM-DD',
    zippedArchive:  true,
    maxSize:        '20m',
    maxFiles:       '30d',
    level,
    format:         jsonFormat,
  });
}

// ── Transports ────────────────────────────────────────────────────────────────

const transports = [];

if (!isTest) {
  // Console: pretty in dev, JSON in prod
  transports.push(
    new winston.transports.Console({
      format: isProd ? jsonFormat : prettyFormat,
      silent: false,
    })
  );

  // app.log — all info+ events
  transports.push(rotatingFile('app', 'info'));

  // error.log — errors only with full stack traces
  transports.push(rotatingFile('error', 'error'));
}

// ── Main application logger ───────────────────────────────────────────────────

const logger = winston.createLogger({
  level:      isProd ? 'http' : 'debug',
  transports,
  // Prevent winston from exiting on uncaught exceptions in production
  exitOnError: false,
});

// ── Specialised loggers (write to separate log files) ────────────────────────

/**
 * Payment-specific logger — writes to logs/payment-YYYY-MM-DD.log.
 * Use for all eSewa gateway events, verification attempts, and failures.
 */
const paymentLogger = winston.createLogger({
  level: 'info',
  transports: isTest ? [] : [
    new winston.transports.Console({
      format: isProd ? jsonFormat : prettyFormat,
      silent: true,
    }),
    rotatingFile('payment', 'info'),
  ],
  exitOnError: false,
});

/**
 * Admin action logger — writes to logs/admin-YYYY-MM-DD.log.
 * Use for all admin mutations (create/update/delete game, user role changes, etc.).
 */
const adminLogger = winston.createLogger({
  level: 'info',
  transports: isTest ? [] : [
    new winston.transports.Console({
      format: isProd ? jsonFormat : prettyFormat,
      silent: true,
    }),
    rotatingFile('admin', 'info'),
  ],
  exitOnError: false,
});

module.exports = { logger, paymentLogger, adminLogger };
