'use strict';

/**
 * Operational application error.
 *
 * Distinguishes expected business errors (invalid input, not found, etc.)
 * from unexpected programming errors. The global error handler uses
 * `isOperational` to decide whether to expose the message to the client.
 */
class AppError extends Error {
  /**
   * @param {string}      message     Human-readable error description.
   * @param {number}      statusCode  HTTP status code.
   * @param {string|null} code        Machine-readable error code for clients.
   */
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name        = 'AppError';
    this.statusCode  = statusCode;
    this.code        = code;
    this.errors      = null; // Optional array of field-level validation errors.
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory helpers ────────────────────────────────────────────────────────

  static badRequest(message, code = 'BAD_REQUEST') {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Insufficient permissions', code = 'FORBIDDEN') {
    return new AppError(message, 403, code);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }
}

module.exports = { AppError };
