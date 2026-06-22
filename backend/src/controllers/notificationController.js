'use strict';

const notificationService = require('../services/notificationService');
const { asyncHandler }    = require('../utils/asyncHandler');
const { sendSuccess }     = require('../utils/responseFormatter');
const { HTTP_STATUS }     = require('../constants/httpStatus');
const { AppError }        = require('../utils/AppError');

const getNotifications = asyncHandler(async (req, res) => {
  const page       = Math.max(1, parseInt(req.query.page  ?? '1',  10));
  const limit      = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
  const unreadOnly = req.query.unread === 'true';

  const result = await notificationService.getNotifications(req.user.uid, { page, limit, unreadOnly });
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Notifications retrieved',
    data:       result,
  });
});

const markRead = asyncHandler(async (req, res) => {
  const notifId = parseInt(req.params.id, 10);
  if (!notifId || isNaN(notifId)) throw AppError.badRequest('Invalid notification ID', 'INVALID_ID');

  const notification = await notificationService.markAsRead(req.user.uid, notifId);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    'Notification marked as read',
    data:       { notification },
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.uid);
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message:    `${result.marked_count} notification(s) marked as read`,
    data:       result,
  });
});

module.exports = { getNotifications, markRead, markAllRead };
