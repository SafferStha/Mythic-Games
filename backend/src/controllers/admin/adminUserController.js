'use strict';

const adminUserService  = require('../../services/adminUserService');
const { asyncHandler }  = require('../../utils/asyncHandler');
const { sendSuccess }   = require('../../utils/responseFormatter');

const adminCtx = (req) => ({
  adminId:   req.user.uid ?? req.user.admin_id,
  adminRole: req.user.role,
  ip:        req.ip,
});

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, status, role } = req.query;
  const result = await adminUserService.getAllUsers({
    page:   parseInt(page)  || 1,
    limit:  parseInt(limit) || 20,
    search: search  || null,
    status: status  || null,
    role:   role    || null,
  });
  return sendSuccess(res, { data: result });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.getUserById(req.params.id);
  return sendSuccess(res, { data: user });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await adminUserService.updateUserStatus(req.params.id, status, adminCtx(req));
  return sendSuccess(res, { data: user });
});

const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await adminUserService.updateUserRole(req.params.id, role, adminCtx(req));
  return sendSuccess(res, { data: user });
});

module.exports = { listUsers, getUser, updateStatus, updateRole };
