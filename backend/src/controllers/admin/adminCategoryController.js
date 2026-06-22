'use strict';

const adminCategoryService = require('../../services/adminCategoryService');
const { asyncHandler }     = require('../../utils/asyncHandler');
const { sendSuccess }      = require('../../utils/responseFormatter');
const { HTTP_STATUS }      = require('../../constants/httpStatus');

const adminCtx = (req) => ({
  adminId:   req.user.uid ?? req.user.admin_id,
  adminRole: req.user.role,
  ip:        req.ip,
});

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await adminCategoryService.getAllCategories();
  return sendSuccess(res, { data: categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const cat = await adminCategoryService.getCategoryById(req.params.id);
  return sendSuccess(res, { data: cat });
});

const createCategory = asyncHandler(async (req, res) => {
  const cat = await adminCategoryService.createCategory(req.body, adminCtx(req));
  return sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, data: cat });
});

const updateCategory = asyncHandler(async (req, res) => {
  const cat = await adminCategoryService.updateCategory(req.params.id, req.body, adminCtx(req));
  return sendSuccess(res, { data: cat });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await adminCategoryService.deleteCategory(req.params.id, adminCtx(req));
  return sendSuccess(res, { message: 'Category deleted successfully' });
});

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
