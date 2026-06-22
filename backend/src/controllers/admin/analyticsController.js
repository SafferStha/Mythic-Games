'use strict';

const analyticsService  = require('../../services/analyticsService');
const { asyncHandler }  = require('../../utils/asyncHandler');
const { sendSuccess }   = require('../../utils/responseFormatter');

const getOverview = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getOverview();
  return sendSuccess(res, { data });
});

const getSales = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const data   = await analyticsService.getSalesAnalytics({ months });
  return sendSuccess(res, { data });
});

const getOrders = asyncHandler(async (_req, res) => {
  const data = await analyticsService.getOrderAnalytics();
  return sendSuccess(res, { data });
});

const getUsers = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const data   = await analyticsService.getUserAnalytics({ months });
  return sendSuccess(res, { data });
});

module.exports = { getOverview, getSales, getOrders, getUsers };
