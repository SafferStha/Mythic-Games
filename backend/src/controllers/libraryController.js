'use strict';

const libraryService   = require('../services/libraryService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess }  = require('../utils/responseFormatter');
const { HTTP_STATUS }  = require('../constants/httpStatus');

const getLibrary = asyncHandler(async (req, res) => {
  const result = await libraryService.getLibrary(req.user.uid);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Library retrieved',
    data:       result,
  });
});

const checkOwnership = asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.gameId, 10);
  if (!gameId || isNaN(gameId)) {
    const { AppError } = require('../utils/AppError');
    throw AppError.badRequest('Invalid game ID', 'INVALID_GAME_ID');
  }

  const owned = await libraryService.isGameOwned(req.user.uid, gameId);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    owned ? 'Game is in your library' : 'Game not owned',
    data:       { owned, game_id: gameId },
  });
});

module.exports = { getLibrary, checkOwnership };
