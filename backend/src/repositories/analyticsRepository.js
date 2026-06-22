'use strict';

const { pool } = require('../config/database');

/**
 * Raw data-access layer for analytics queries.
 * All queries are read-only aggregations — no writes.
 */

async function getRevenueStats() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(SUM(grand_total) FILTER (WHERE payment_status = 'paid'), 0)              AS total_revenue,
      COALESCE(SUM(grand_total) FILTER (WHERE payment_status = 'paid'
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())), 0)           AS monthly_revenue,
      COALESCE(SUM(grand_total) FILTER (WHERE payment_status = 'paid'
        AND DATE_TRUNC('year', created_at)  = DATE_TRUNC('year',  NOW())), 0)           AS yearly_revenue
    FROM orders
  `);
  return rows[0];
}

async function getOrderStats() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)                                                         AS total_orders,
      COUNT(*) FILTER (WHERE order_status = 'processing')             AS processing_orders,
      COUNT(*) FILTER (WHERE order_status = 'completed')              AS completed_orders,
      COUNT(*) FILTER (WHERE order_status = 'cancelled')              AS cancelled_orders,
      COUNT(*) FILTER (WHERE order_status = 'refunded')               AS refunded_orders,
      COUNT(*) FILTER (WHERE payment_status = 'paid')                 AS paid_orders,
      COUNT(*) FILTER (WHERE payment_status = 'pending')              AS pending_orders,
      COUNT(*) FILTER (WHERE payment_status = 'failed')               AS failed_orders
    FROM orders
  `);
  return rows[0];
}

async function getUserStats() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)                                                                    AS total_users,
      COUNT(*) FILTER (WHERE status = 'active')                                  AS active_users,
      COUNT(*) FILTER (WHERE status = 'banned')                                  AS banned_users,
      COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS new_this_month,
      COUNT(*) FILTER (WHERE DATE_TRUNC('week',  created_at) = DATE_TRUNC('week',  NOW())) AS new_this_week
    FROM users
  `);
  return rows[0];
}

async function getGameStats() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)                                   AS total_games,
      COUNT(*) FILTER (WHERE status = 'active')  AS active_games,
      COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_games,
      COUNT(*) FILTER (WHERE stock = 0)           AS out_of_stock,
      COUNT(*) FILTER (WHERE stock > 0 AND stock <= 10) AS low_stock
    FROM games
    WHERE status != 'deleted'
  `);
  return rows[0];
}

async function getPaymentStats() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)                                                     AS total_payments,
      COUNT(*) FILTER (WHERE payment_status = 'verified')         AS verified_payments,
      COUNT(*) FILTER (WHERE payment_status = 'failed')           AS failed_payments,
      COUNT(*) FILTER (WHERE payment_status = 'initiated')        AS initiated_payments,
      COALESCE(SUM(amount) FILTER (WHERE payment_status = 'verified'), 0) AS total_verified_amount
    FROM payments
  `);
  return rows[0];
}

async function getTopSellingGames({ limit = 10 } = {}) {
  const { rows } = await pool.query(
    `SELECT
       g.id, g.title, g.slug, g.cover_image, g.price,
       SUM(oi.quantity)              AS total_sold,
       SUM(oi.quantity * oi.price)   AS total_revenue
     FROM order_items oi
     JOIN games  g ON oi.game_id   = g.id
     JOIN orders o ON oi.order_id  = o.id
     WHERE o.payment_status = 'paid'
     GROUP BY g.id, g.title, g.slug, g.cover_image, g.price
     ORDER BY total_sold DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function getLowStockGames({ threshold = 10 } = {}) {
  const { rows } = await pool.query(
    `SELECT id, title, slug, stock, status, cover_image
       FROM games
      WHERE stock <= $1
        AND status != 'deleted'
      ORDER BY stock ASC
      LIMIT 20`,
    [threshold]
  );
  return rows;
}

async function getMonthlySales({ months = 12 } = {}) {
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
       COUNT(*)                                            AS total_orders,
       COALESCE(SUM(grand_total), 0)                       AS revenue
     FROM orders
     WHERE payment_status = 'paid'
       AND created_at >= NOW() - INTERVAL '1 month' * $1
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at) ASC`,
    [months]
  );
  return rows;
}

async function getMonthlyRegistrations({ months = 12 } = {}) {
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
       COUNT(*)                                            AS registrations
     FROM users
     WHERE created_at >= NOW() - INTERVAL '1 month' * $1
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at) ASC`,
    [months]
  );
  return rows;
}

async function getOrderStatusBreakdown() {
  const { rows } = await pool.query(`
    SELECT order_status AS status, COUNT(*) AS count
    FROM orders
    GROUP BY order_status
  `);
  return rows;
}

module.exports = {
  getRevenueStats,
  getOrderStats,
  getUserStats,
  getGameStats,
  getPaymentStats,
  getTopSellingGames,
  getLowStockGames,
  getMonthlySales,
  getMonthlyRegistrations,
  getOrderStatusBreakdown,
};
