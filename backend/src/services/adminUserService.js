'use strict';

const userRepository     = require('../repositories/userRepository');
const adminLogRepository = require('../repositories/adminLogRepository');
const { AppError }       = require('../utils/AppError');
const { ROLES }          = require('../constants/roles');

const VALID_STATUSES = ['active', 'banned', 'inactive'];
const VALID_ROLES    = [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN];

async function getAllUsers({ page, limit, search, status, role } = {}) {
  return userRepository.findAllPaginated({ page, limit, search, status, role });
}

async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
}

async function updateUserStatus(id, status, adminCtx) {
  if (!VALID_STATUSES.includes(status)) {
    throw AppError.badRequest(`Invalid status: ${status}`, 'INVALID_STATUS');
  }

  const user = await userRepository.findById(id);
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  const updated = await userRepository.updateStatus(id, status);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'UPDATE_USER_STATUS',
    entity:    'user',
    entityId:  id,
    detail:    { from: user.status, to: status },
    ipAddress: adminCtx.ip,
  });

  return updated;
}

async function updateUserRole(id, role, adminCtx) {
  if (!VALID_ROLES.includes(role)) {
    throw AppError.badRequest(`Invalid role: ${role}`, 'INVALID_ROLE');
  }

  // Only super_admin can promote to admin/super_admin
  if ((role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) &&
       adminCtx.adminRole !== ROLES.SUPER_ADMIN) {
    throw AppError.forbidden('Only super admins can promote users to admin roles', 'AUTH_FORBIDDEN');
  }

  const user = await userRepository.findById(id);
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  const updated = await userRepository.updateRole(id, role);

  await adminLogRepository.create({
    adminId:   adminCtx.adminId,
    adminRole: adminCtx.adminRole,
    action:    'UPDATE_USER_ROLE',
    entity:    'user',
    entityId:  id,
    detail:    { from: user.role, to: role },
    ipAddress: adminCtx.ip,
  });

  return updated;
}

module.exports = { getAllUsers, getUserById, updateUserStatus, updateUserRole };
