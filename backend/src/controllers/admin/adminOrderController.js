'use strict';

const adminOrderService = require('../../services/adminOrderService');
const { asyncHandler }  = require('../../utils/asyncHandler');
const { sendSuccess }   = require('../../utils/responseFormatter');

const adminCtx = (req) => ({
  adminId:   req.user.uid ?? req.user.admin_id,
  adminRole: req.user.role,
  ip:        req.ip,
});

const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, orderStatus, paymentStatus, search } = req.query;
  const result = await adminOrderService.getAllOrders({
    page:          parseInt(page)  || 1,
    limit:         parseInt(limit) || 20,
    orderStatus:   orderStatus   || null,
    paymentStatus: paymentStatus || null,
    search:        search        || null,
  });
  return sendSuccess(res, { data: result });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await adminOrderService.getOrderById(req.params.id);
  return sendSuccess(res, { data: order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const updated = await adminOrderService.updateOrderStatus(
    req.params.id, { orderStatus, paymentStatus }, adminCtx(req)
  );
  return sendSuccess(res, { data: updated });
});

module.exports = { listOrders, getOrder, updateStatus };
