'use strict';

const notificationRepository = require('../repositories/notificationRepository');

async function createNotification({ userId, type, title, message, metadata }) {
  return notificationRepository.create({ userId, type, title, message, metadata });
}

async function getNotifications(userId, { page, limit, unreadOnly } = {}) {
  const result      = await notificationRepository.findByUserId(userId, { page, limit, unreadOnly });
  const unreadCount = await notificationRepository.countUnread(userId);
  return { ...result, unread_count: unreadCount };
}

async function markAsRead(userId, notificationId) {
  const notification = await notificationRepository.markRead(notificationId, userId);
  if (!notification) {
    const { AppError } = require('../utils/AppError');
    throw AppError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
  }
  return notification;
}

async function markAllAsRead(userId) {
  const count = await notificationRepository.markAllRead(userId);
  return { marked_count: count };
}

async function notifyPaymentSuccess(userId, order) {
  return createNotification({
    userId,
    type:    'payment_success',
    title:   'Payment Successful',
    message: `Your order ${order.order_number} was paid successfully. Games added to your library.`,
    metadata: { order_id: order.id, order_number: order.order_number },
  });
}

async function notifyRefundUpdate(userId, refund, status) {
  const messages = {
    approved:  'Your refund request has been approved and is being processed.',
    rejected:  'Your refund request was reviewed and could not be approved.',
    processed: 'Your refund has been processed. Funds will be returned within 3-5 business days.',
  };

  const types = {
    approved:  'refund_approved',
    rejected:  'refund_rejected',
    processed: 'refund_processed',
  };

  return createNotification({
    userId,
    type:    types[status] ?? 'general',
    title:   `Refund ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: messages[status] ?? `Your refund status is: ${status}`,
    metadata: { refund_id: refund.id, order_id: refund.order_id },
  });
}

async function broadcastAnnouncement(userIds, { title, message, metadata }) {
  const entries = userIds.map((uid) => ({
    userId:   uid,
    type:     'admin_announcement',
    title,
    message,
    metadata: metadata ?? null,
  }));

  return notificationRepository.createBulk(entries);
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  notifyPaymentSuccess,
  notifyRefundUpdate,
  broadcastAnnouncement,
};
