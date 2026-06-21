'use strict';

/**
 * Wraps an async Express route handler and forwards any thrown errors
 * to Express's next() — eliminating repetitive try/catch in every controller.
 *
 * Works with both async functions and sync functions that throw.
 * Express 5 handles thrown synchronous errors natively, but this wrapper
 * makes intent explicit and keeps controllers consistent.
 *
 * @param {Function} fn  Async route handler (req, res, next) => Promise
 * @returns {Function}   Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
