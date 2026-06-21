'use strict';

/**
 * Game catalog status constants.
 * Mirrored in games.status DB CHECK constraint.
 */
const GAME_STATUS = Object.freeze({
  ACTIVE:       'active',
  INACTIVE:     'inactive',
  COMING_SOON:  'coming_soon',
});

const CART_STATUS = Object.freeze({
  ACTIVE:     'active',
  CONVERTED:  'converted',  // cart became an order
  ABANDONED:  'abandoned',
});

module.exports = { GAME_STATUS, CART_STATUS };
