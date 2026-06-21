'use strict';

const userService              = require('../services/userService');
const { validateUserPayload }  = require('../validators/userValidator');
const { asyncHandler }         = require('../utils/asyncHandler');
const { sendSuccess }          = require('../utils/responseFormatter');
const { HTTP_STATUS }          = require('../constants/httpStatus');

/**
 * GET /api/users
 * Returns all users. Admin only.
 */
const listUsers = asyncHandler(async (_req, res) => {
  const users = await userService.getAllUsers();
  return sendSuccess(res, { data: users });
});

/**
 * GET /api/users/:id
 * Returns a single user by ID. Admin only.
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, { data: user });
});

/**
 * POST /api/users
 * Creates a user directly (admin operation — bypasses registration flow).
 */
const createUser = asyncHandler(async (req, res) => {
  const payload = validateUserPayload(req.body);
  const user    = await userService.createUser(payload);
  return sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, data: user });
});

/**
 * PUT /api/users/:id
 * Fully replaces user fields.
 */
const updateUser = asyncHandler(async (req, res) => {
  const payload = validateUserPayload(req.body);
  const user    = await userService.updateUser(req.params.id, payload);
  return sendSuccess(res, { data: user });
});

/**
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return sendSuccess(res, { message: 'User deleted successfully' });
});

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
