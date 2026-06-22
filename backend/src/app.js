'use strict';

const express         = require('express');
const cors            = require('cors');
const helmet          = require('helmet');
const cookieParser    = require('cookie-parser');
const hpp             = require('hpp');
const compression     = require('compression');
const mongoSanitize   = require('express-mongo-sanitize');

const routes           = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger }  = require('./middlewares/requestLogger');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { sendSuccess, sendError } = require('./utils/responseFormatter');
const { logger }       = require('./utils/logger');
const env              = require('./config/env');

// ── Production secret guard ───────────────────────────────────────────────────
// Fail fast if dev-only default secrets are used in production.
if (env.NODE_ENV === 'production') {
  const DEFAULT_JWT     = 'mythic-dev-secret-change-in-production';
  const DEFAULT_REFRESH = 'mythic-dev-refresh-change-in-production';
  if (env.JWT_SECRET === DEFAULT_JWT || env.JWT_REFRESH_SECRET === DEFAULT_REFRESH) {
    logger.error('FATAL: Default JWT secrets detected in production. Set JWT_SECRET and JWT_REFRESH_SECRET env vars.');
    process.exit(1);
  }
}

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── HTTP Parameter Pollution prevention ──────────────────────────────────────
// Prevents query string pollution attacks (e.g. ?status=active&status=admin).
app.use(hpp());

// ── NoSQL injection prevention ────────────────────────────────────────────────
// Strips $ and . characters from req.body / req.query / req.params so MongoDB
// operator injection can't reach downstream query builders.
app.use(mongoSanitize());

// ── Observability ─────────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Rate limiting (global) ─────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  let dbStatus = 'unknown';

  try {
    const { pool } = require('./config/database');
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const status = dbStatus === 'connected' ? 'ok' : 'degraded';
  const code   = dbStatus === 'connected' ? 200 : 503;

  res.status(code).json({
    success:  dbStatus === 'connected',
    status,
    database: dbStatus,
    uptime:   process.uptime(),
    version:  process.env.npm_package_version ?? '1.0.0',
    env:      env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) =>
  sendSuccess(res, { message: 'Mythic Games API v1', env: env.NODE_ENV })
);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) =>
  sendError(res, {
    statusCode: 404,
    message:    `Route ${req.method} ${req.path} not found`,
    code:       'ROUTE_NOT_FOUND',
  })
);

// ── Global error handler — MUST be last ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
