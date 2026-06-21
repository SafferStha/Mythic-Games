'use strict';

/**
 * Application-wide role constants.
 * Use these instead of raw string literals to prevent typo-based bugs.
 */
const ROLES = Object.freeze({
  USER:  'user',
  ADMIN: 'admin',
});

module.exports = { ROLES };
