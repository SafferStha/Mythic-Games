'use strict';

const adminGameService  = require('../../services/adminGameService');
const { asyncHandler }  = require('../../utils/asyncHandler');
const { sendSuccess }   = require('../../utils/responseFormatter');
const { HTTP_STATUS }   = require('../../constants/httpStatus');

const adminCtx = (req) => ({
  adminId:   req.user.uid ?? req.user.admin_id,
  adminRole: req.user.role,
  ip:        req.ip,
});

const listGames = asyncHandler(async (req, res) => {
  const { page, limit, categoryId, status, search, platform } = req.query;
  const result = await adminGameService.getAllGames({
    page:       parseInt(page)  || 1,
    limit:      parseInt(limit) || 20,
    categoryId: categoryId || null,
    status:     status     || null,
    search:     search     || null,
    platform:   platform   || null,
  });
  return sendSuccess(res, { data: result });
});

const getGame = asyncHandler(async (req, res) => {
  const game = await adminGameService.getGameById(req.params.id);
  return sendSuccess(res, { data: game });
});

const createGame = asyncHandler(async (req, res) => {
  const game = await adminGameService.createGame(req.body, adminCtx(req));
  return sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, data: game });
});

const updateGame = asyncHandler(async (req, res) => {
  const game = await adminGameService.updateGame(req.params.id, req.body, adminCtx(req));
  return sendSuccess(res, { data: game });
});

const deleteGame = asyncHandler(async (req, res) => {
  await adminGameService.deleteGame(req.params.id, adminCtx(req));
  return sendSuccess(res, { message: 'Game deleted successfully' });
});

module.exports = { listGames, getGame, createGame, updateGame, deleteGame };
