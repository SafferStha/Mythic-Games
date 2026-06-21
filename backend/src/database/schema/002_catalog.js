'use strict';

/**
 * Migration 002 — Game Catalog Schema
 *
 * Tables: categories, games
 * Relationship: 1 category → many games (FK ON DELETE SET NULL)
 */
module.exports = async function catalogSchema(client) {
  // ── Categories ──────────────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          SERIAL        PRIMARY KEY,
      name        VARCHAR(100)  NOT NULL,
      slug        VARCHAR(100)  UNIQUE NOT NULL,
      icon        VARCHAR(255),
      description TEXT,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
  `);

  // ── Games ───────────────────────────────────────────────────────────────────
  // Separate query so FK to categories is resolved after that table exists.
  await client.query(`
    CREATE TABLE IF NOT EXISTS games (
      id                SERIAL        PRIMARY KEY,
      title             VARCHAR(255)  NOT NULL,
      slug              VARCHAR(255)  UNIQUE NOT NULL,
      description       TEXT,
      short_description VARCHAR(500),
      price             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      discount_price    NUMERIC(10,2),
      stock             INTEGER       NOT NULL DEFAULT 0,
      cover_image       TEXT,
      banner_image      TEXT,
      category_id       INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
      publisher         VARCHAR(255),
      developer         VARCHAR(255),
      release_date      DATE,
      platform          VARCHAR(100)  NOT NULL DEFAULT 'PC',
      rating            NUMERIC(3,1),
      status            VARCHAR(20)   NOT NULL DEFAULT 'active',
      created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

      CONSTRAINT games_price_non_negative    CHECK (price >= 0),
      CONSTRAINT games_stock_non_negative    CHECK (stock >= 0),
      CONSTRAINT games_discount_non_negative CHECK (discount_price IS NULL OR discount_price >= 0),
      CONSTRAINT games_rating_range          CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 5.0)),
      CONSTRAINT games_status_valid          CHECK (status IN ('active', 'inactive', 'coming_soon'))
    );

    CREATE INDEX IF NOT EXISTS idx_games_slug        ON games(slug);
    CREATE INDEX IF NOT EXISTS idx_games_category_id ON games(category_id);
    CREATE INDEX IF NOT EXISTS idx_games_status      ON games(status);
    CREATE INDEX IF NOT EXISTS idx_games_price       ON games(price);
    CREATE INDEX IF NOT EXISTS idx_games_created_at  ON games(created_at DESC);
  `);
};
