'use strict';

/**
 * Migration 003 — Commerce Schema
 *
 * Tables: carts, cart_items, orders, order_items
 *
 * FK strategies:
 *   carts.user_id       → ON DELETE CASCADE  (cart goes with user)
 *   cart_items.cart_id  → ON DELETE CASCADE  (items go with cart)
 *   cart_items.game_id  → ON DELETE CASCADE  (item removed if game removed)
 *   orders.user_id      → ON DELETE RESTRICT (never lose financial records)
 *   orders.cart_id      → ON DELETE SET NULL (carts can be purged safely)
 *   order_items.order_id→ ON DELETE CASCADE  (items go with order)
 *   order_items.game_id → ON DELETE SET NULL (preserve history if game removed)
 */
module.exports = async function commerceSchema(client) {
  // ── Carts ────────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id         SERIAL      PRIMARY KEY,
      user_id    BIGINT      NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
      status     VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT carts_status_valid CHECK (status IN ('active', 'converted', 'abandoned'))
    );

    -- Lookup carts by user
    CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

    -- Fast "find active cart for user" query
    CREATE INDEX IF NOT EXISTS idx_carts_user_active
      ON carts(user_id) WHERE status = 'active';
  `);

  // ── Cart Items ───────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id         SERIAL        PRIMARY KEY,
      cart_id    INTEGER       NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      game_id    INTEGER       NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      quantity   INTEGER       NOT NULL DEFAULT 1,
      unit_price NUMERIC(10,2) NOT NULL,
      subtotal   NUMERIC(10,2) NOT NULL,
      added_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      -- Prevent the same game appearing twice in one cart
      CONSTRAINT cart_items_unique_game         UNIQUE (cart_id, game_id),
      CONSTRAINT cart_items_quantity_positive   CHECK  (quantity > 0),
      CONSTRAINT cart_items_price_non_negative  CHECK  (unit_price >= 0),
      CONSTRAINT cart_items_subtotal_non_negative CHECK (subtotal >= 0)
    );

    CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    CREATE INDEX IF NOT EXISTS idx_cart_items_game_id ON cart_items(game_id);
  `);

  // ── Orders ───────────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id             SERIAL        PRIMARY KEY,
      user_id        BIGINT        NOT NULL REFERENCES users(uid) ON DELETE RESTRICT,
      cart_id        INTEGER       REFERENCES carts(id) ON DELETE SET NULL,
      order_number   VARCHAR(50)   UNIQUE NOT NULL,
      subtotal       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      tax            NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      discount       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      grand_total    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      payment_status VARCHAR(20)   NOT NULL DEFAULT 'pending',
      order_status   VARCHAR(20)   NOT NULL DEFAULT 'processing',
      notes          TEXT,
      created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT orders_subtotal_non_negative    CHECK (subtotal >= 0),
      CONSTRAINT orders_tax_non_negative         CHECK (tax >= 0),
      CONSTRAINT orders_discount_non_negative    CHECK (discount >= 0),
      CONSTRAINT orders_grand_total_non_negative CHECK (grand_total >= 0),
      CONSTRAINT orders_payment_status_valid     CHECK (payment_status IN ('pending','paid','failed','refunded')),
      CONSTRAINT orders_order_status_valid       CHECK (order_status   IN ('processing','completed','cancelled'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_order_status   ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders(created_at DESC);
  `);

  // ── Order Items ──────────────────────────────────────────────────────────────
  // Prices are snapshots captured at checkout — not affected by later game updates.
  await client.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id         SERIAL        PRIMARY KEY,
      order_id   INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      game_id    INTEGER       REFERENCES games(id) ON DELETE SET NULL,
      quantity   INTEGER       NOT NULL DEFAULT 1,
      price      NUMERIC(10,2) NOT NULL,
      subtotal   NUMERIC(10,2) NOT NULL,
      game_title VARCHAR(255)  NOT NULL,

      CONSTRAINT order_items_quantity_positive    CHECK (quantity > 0),
      CONSTRAINT order_items_price_non_negative   CHECK (price >= 0),
      CONSTRAINT order_items_subtotal_non_negative CHECK (subtotal >= 0)
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_game_id  ON order_items(game_id);
  `);
};
