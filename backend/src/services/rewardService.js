'use strict';

const rewardRepository = require('../repositories/rewardRepository');

const POINTS_PER_NPR = 0.01; // 1 point per NPR 100 spent

async function getRewardBalance(userId) {
  const record = await rewardRepository.findByUserId(userId);
  if (!record) {
    return { balance: 0, total_earned: 0, total_spent: 0 };
  }
  return {
    balance:       parseFloat(record.balance),
    total_earned:  parseFloat(record.total_earned),
    total_spent:   parseFloat(record.total_spent),
    updated_at:    record.updated_at,
  };
}

async function getTransactionHistory(userId, { page, limit } = {}) {
  return rewardRepository.getTransactions(userId, { page, limit });
}

/**
 * Credits reward points to a user after a successful purchase.
 * Called from paymentService.markPaymentVerified (non-fatal).
 *
 * @param {number|string} userId
 * @param {number}        orderId
 * @param {number}        grandTotal   NPR amount paid
 */
async function earnPoints(userId, orderId, grandTotal) {
  const points = Math.floor(parseFloat(grandTotal) * POINTS_PER_NPR);
  if (points <= 0) return null;

  const [record, tx] = await Promise.all([
    rewardRepository.upsertEarn(userId, points),
    rewardRepository.createTransaction({
      userId,
      orderId,
      type:        'earn',
      points,
      description: `Earned for order #${orderId}`,
    }),
  ]);

  return { record, transaction: tx };
}

async function spendPoints(userId, points, description = 'Points redeemed') {
  const record = await rewardRepository.spend(userId, points);
  if (!record) {
    const { AppError } = require('../utils/AppError');
    throw AppError.badRequest('Insufficient reward points', 'INSUFFICIENT_POINTS');
  }

  await rewardRepository.createTransaction({
    userId,
    orderId:     null,
    type:        'spend',
    points,
    description,
  });

  return record;
}

module.exports = {
  getRewardBalance,
  getTransactionHistory,
  earnPoints,
  spendPoints,
};
