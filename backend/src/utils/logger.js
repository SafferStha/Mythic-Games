'use strict';

const env = require('../config/env');

// ANSI colour codes for terminal output
const COLOURS = Object.freeze({
  error: '\x1b[31m', // red
  warn:  '\x1b[33m', // yellow
  info:  '\x1b[36m', // cyan
  http:  '\x1b[35m', // magenta
  debug: '\x1b[37m', // white
  reset: '\x1b[0m',
});

const LEVEL_PRIORITY = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const ACTIVE_LEVEL   = env.NODE_ENV === 'production' ? 'http' : 'debug';

/**
 * Lightweight structured logger.
 * Outputs coloured, timestamped lines to stdout/stderr.
 * Swap this module for a Winston/Pino adapter when log aggregation is needed.
 */
function write(level, message, meta) {
  if (LEVEL_PRIORITY[level] > LEVEL_PRIORITY[ACTIVE_LEVEL]) return;

  const colour    = COLOURS[level] ?? '';
  const reset     = COLOURS.reset;
  const timestamp = new Date().toISOString();
  const metaStr   = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const line      = `${colour}[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}${reset}`;

  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

const logger = {
  error: (msg, meta) => write('error', msg, meta),
  warn:  (msg, meta) => write('warn',  msg, meta),
  info:  (msg, meta) => write('info',  msg, meta),
  http:  (msg, meta) => write('http',  msg, meta),
  debug: (msg, meta) => write('debug', msg, meta),
};

module.exports = { logger };
