'use strict';

const userRepository = require('../repositories/userRepository');
const { AppError }   = require('../utils/AppError');

/**
 * Business logic for user management.
 * Owns uniqueness checks, error mapping, and any orchestration needed
 * before persisting to the repository.
 */

async function getAllUsers() {
  return userRepository.findAll();
}

async function getUserById(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return user;
}

async function createUser({ username, email, password, status = 'active' }) {
  const existing = await userRepository.findByEmailOrUsername(email, username);

  if (existing) {
    throw AppError.conflict(
      'A user with that email or username already exists',
      'USER_DUPLICATE'
    );
  }

  return userRepository.create({ username, email, password, status });
}

async function updateUser(userId, { username, email, password, status }) {
  const existing = await userRepository.findByEmailOrUsername(email, username);

  if (existing && String(existing.uid) !== String(userId)) {
    throw AppError.conflict(
      'A user with that email or username already exists',
      'USER_DUPLICATE'
    );
  }

  const user = await userRepository.update(userId, { username, email, password, status });

  if (!user) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return user;
}

async function deleteUser(userId) {
  const removed = await userRepository.remove(userId);

  if (!removed) {
    throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
