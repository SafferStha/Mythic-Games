'use strict';

const analyticsService  = require('../../services/analyticsService');
const { asyncHandler }  = require('../../utils/asyncHandler');
const { sendSuccess }   = require('../../utils/responseFormatter');

const getDashboard = asyncHandler(async (_req, res) => {
  const overview = await analyticsService.getOverview();
  return sendSuccess(res, { data: overview });
});

module.exports = { getDashboard };
