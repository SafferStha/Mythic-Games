'use strict';

/**
 * Migration 006 — Gaming Ecosystem Schema (Phase 10)
 *
 * Tables: wishlists, wishlist_items, coupons, coupon_usages, reviews,
 *         notifications, refunds, libraries, game_keys, reward_points,
 *         reward_transactions, friends, friend_requests
 *
 * Also: ALTER orders to support coupon tracking.
 */
module.exports = async function ecosystemSchema(client) {

  // ── Coupons ──────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id              SERIAL        PRIMARY KEY,
      code            VARCHAR(50)   UNIQUE NOT NULL,
      type            VARCHAR(20)   NOT NULL DEFAULT 'percentage',
      value           NUMERIC(10,2) NOT NULL,
      min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      usage_limit     INTEGER,
      expires_at      TIMESTAMPTZ,
      is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT coupons_type_valid   CHECK (type  IN ('percentage', 'fixed')),
      CONSTRAINT coupons_value_pos    CHECK (value  > 0),
      CONSTRAINT coupons_min_order_nn CHECK (min_order_value >= 0)
    );

    CREATE INDEX IF NOT EXISTS idx_coupons_code      ON coupons(code);
    CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
  `);

  // ── Coupon Usages ─────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS coupon_usages (
      id         SERIAL      PRIMARY KEY,
      coupon_id  INTEGER     NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
      user_id    BIGINT      NOT NULL REFERENCES users(uid)  ON DELETE CASCADE,
      order_id   INTEGER     NOT NULL REFERENCES orders(id)  ON DELETE CASCADE,
      used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- One coupon per order
      CONSTRAINT coupon_usages_unique_order UNIQUE (order_id)
    );

    CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
    CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id   ON coupon_usages(user_id);
  `);

  // ── Orders coupon columns (idempotent ALTER) ──────────────────────────────────
  await client.query(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS coupon_id   INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
  `);

  // ── Libraries (game ownership) ────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS libraries (
      id            SERIAL      PRIMARY KEY,
      user_id       BIGINT      NOT NULL REFERENCES users(uid)   ON DELETE CASCADE,
      game_id       INTEGER     REFERENCES games(id)             ON DELETE SET NULL,
      order_id      INTEGER     REFERENCES orders(id)            ON DELETE SET NULL,
      game_title    VARCHAR(255) NOT NULL,
      purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- Prevent duplicate ownership
      CONSTRAINT libraries_unique_ownership UNIQUE (user_id, game_id)
    );

    CREATE INDEX IF NOT EXISTS idx_libraries_user_id ON libraries(user_id);
    CREATE INDEX IF NOT EXISTS idx_libraries_game_id ON libraries(game_id);
  `);

  // ── Wishlists ─────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id         SERIAL      PRIMARY KEY,
      user_id    BIGINT      UNIQUE NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
  `);

  // ── Wishlist Items ────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id          SERIAL      PRIMARY KEY,
      wishlist_id INTEGER     NOT NULL REFERENCES wishlists(id)  ON DELETE CASCADE,
      game_id     INTEGER     NOT NULL REFERENCES games(id)      ON DELETE CASCADE,
      added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- One entry per game per wishlist
      CONSTRAINT wishlist_items_unique_game UNIQUE (wishlist_id, game_id)
    );

    CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_items_game_id     ON wishlist_items(game_id);
  `);

  // ── Reviews ───────────────────────────────────────────────────────────────────
  // Only verified purchasers can review — enforced at service layer.
  await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id          SERIAL      PRIMARY KEY,
      user_id     BIGINT      NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      game_id     INTEGER     NOT NULL REFERENCES games(id)  ON DELETE CASCADE,
      rating      SMALLINT    NOT NULL,
      review_text TEXT,
      is_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- One review per game per user
      CONSTRAINT reviews_unique_per_user_game UNIQUE (user_id, game_id),
      CONSTRAINT reviews_rating_range         CHECK  (rating BETWEEN 1 AND 5)
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_game_id  ON reviews(game_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id  ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_rating   ON reviews(rating);
  `);

  // ── Notifications ─────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id         SERIAL        PRIMARY KEY,
      user_id    BIGINT        NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      type       VARCHAR(50)   NOT NULL,
      title      VARCHAR(255)  NOT NULL,
      message    TEXT          NOT NULL,
      is_read    BOOLEAN       NOT NULL DEFAULT FALSE,
      metadata   JSONB,
      created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT notifications_type_valid CHECK (type IN (
        'payment_success', 'order_completed', 'order_failed',
        'refund_approved', 'refund_rejected', 'refund_processed',
        'coupon_alert', 'discount', 'admin_announcement', 'general'
      ))
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read  ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at DESC);
  `);

  // ── Refunds ───────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS refunds (
      id          SERIAL      PRIMARY KEY,
      order_id    INTEGER     NOT NULL REFERENCES orders(id)  ON DELETE RESTRICT,
      user_id     BIGINT      NOT NULL REFERENCES users(uid)  ON DELETE RESTRICT,
      reason      TEXT        NOT NULL,
      status      VARCHAR(20) NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT refunds_status_valid CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
      -- One refund request per order
      CONSTRAINT refunds_unique_order UNIQUE (order_id)
    );

    CREATE INDEX IF NOT EXISTS idx_refunds_user_id  ON refunds(user_id);
    CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
    CREATE INDEX IF NOT EXISTS idx_refunds_status   ON refunds(status);
  `);

  // ── Game Keys (schema only — future digital license delivery) ─────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS game_keys (
      id          SERIAL       PRIMARY KEY,
      game_id     INTEGER      REFERENCES games(id) ON DELETE SET NULL,
      key         VARCHAR(100) UNIQUE NOT NULL,
      assigned_to BIGINT       REFERENCES users(uid) ON DELETE SET NULL,
      assigned_at TIMESTAMPTZ,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_game_keys_game_id     ON game_keys(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_keys_assigned_to ON game_keys(assigned_to);
  `);

  // ── Reward Points ─────────────────────────────────────────────────────────────
  // One row per user — balance is updated in-place.
  await client.query(`
    CREATE TABLE IF NOT EXISTS reward_points (
      id            SERIAL        PRIMARY KEY,
      user_id       BIGINT        UNIQUE NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      total_earned  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      total_spent   NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      balance       NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT reward_points_balance_nn      CHECK (balance >= 0),
      CONSTRAINT reward_points_earned_nn       CHECK (total_earned >= 0),
      CONSTRAINT reward_points_spent_nn        CHECK (total_spent >= 0)
    );
  `);

  // ── Reward Transactions ───────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS reward_transactions (
      id          SERIAL        PRIMARY KEY,
      user_id     BIGINT        NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      order_id    INTEGER       REFERENCES orders(id) ON DELETE SET NULL,
      type        VARCHAR(10)   NOT NULL,
      points      NUMERIC(12,2) NOT NULL,
      description VARCHAR(255)  NOT NULL,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT reward_tx_type_valid  CHECK (type IN ('earn', 'spend')),
      CONSTRAINT reward_tx_points_pos  CHECK (points > 0)
    );

    CREATE INDEX IF NOT EXISTS idx_reward_tx_user_id ON reward_transactions(user_id);
  `);

  // ── Friends (social layer — schema only for future) ───────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS friends (
      id         SERIAL      PRIMARY KEY,
      user_id    BIGINT      NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      friend_id  BIGINT      NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT friends_no_self        CHECK  (user_id <> friend_id),
      CONSTRAINT friends_unique_pair    UNIQUE (user_id, friend_id)
    );

    CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
  `);

  // ── Friend Requests (social layer — schema only) ──────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id          SERIAL      PRIMARY KEY,
      sender_id   BIGINT      NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      receiver_id BIGINT      NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      status      VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT friend_requests_no_self     CHECK  (sender_id <> receiver_id),
      CONSTRAINT friend_requests_unique_pair UNIQUE (sender_id, receiver_id),
      CONSTRAINT friend_requests_status_valid CHECK (status IN ('pending', 'accepted', 'rejected'))
    );
  `);
};
