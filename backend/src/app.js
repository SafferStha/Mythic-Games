'use strict';

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');

const routes           = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { requestLogger }  = require('./middlewares/requestLogger');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { sendSuccess, sendError } = require('./utils/responseFormatter');
const env = require('./config/env');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin:      env.CORS_ORIGIN,
  credentials: true, // required for httpOnly cookie (refresh token)
}));

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Observability ─────────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Rate limiting (global) ─────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  sendSuccess(res, { message: 'Mythic Games backend is running' })
);

app.get('/', (_req, res) =>
  sendSuccess(res, { message: 'Mythic Games API v1' })
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
