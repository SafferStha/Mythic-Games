'use strict';

const analyticsRepository = require('../repositories/analyticsRepository');

async function getOverview() {
  const [revenue, orders, users, games, payments] = await Promise.all([
    analyticsRepository.getRevenueStats(),
    analyticsRepository.getOrderStats(),
    analyticsRepository.getUserStats(),
    analyticsRepository.getGameStats(),
    analyticsRepository.getPaymentStats(),
  ]);

  return { revenue, orders, users, games, payments };
}

async function getSalesAnalytics({ months = 12 } = {}) {
  const [monthlySales, topGames, lowStock] = await Promise.all([
    analyticsRepository.getMonthlySales({ months }),
    analyticsRepository.getTopSellingGames({ limit: 10 }),
    analyticsRepository.getLowStockGames({ threshold: 10 }),
  ]);

  return { monthlySales, topGames, lowStock };
}

async function getOrderAnalytics() {
  const [stats, breakdown] = await Promise.all([
    analyticsRepository.getOrderStats(),
    analyticsRepository.getOrderStatusBreakdown(),
  ]);

  return { stats, breakdown };
}

async function getUserAnalytics({ months = 12 } = {}) {
  const [stats, monthlyRegistrations] = await Promise.all([
    analyticsRepository.getUserStats(),
    analyticsRepository.getMonthlyRegistrations({ months }),
  ]);

  return { stats, monthlyRegistrations };
}

module.exports = { getOverview, getSalesAnalytics, getOrderAnalytics, getUserAnalytics };
