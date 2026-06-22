'use strict';

const { Router }   = require('express');
const { authenticate }              = require('../middlewares/authMiddleware');
const { requireAdmin, requireSuperAdmin } = require('../middlewares/adminGuard');

const dashboardCtrl  = require('../controllers/admin/dashboardController');
const gameCtrl       = require('../controllers/admin/adminGameController');
const categoryCtrl   = require('../controllers/admin/adminCategoryController');
const orderCtrl      = require('../controllers/admin/adminOrderController');
const paymentCtrl    = require('../controllers/admin/adminPaymentController');
const userCtrl       = require('../controllers/admin/adminUserController');
const invoiceCtrl    = require('../controllers/admin/adminInvoiceController');
const receiptCtrl    = require('../controllers/admin/adminReceiptController');
const analyticsCtrl  = require('../controllers/admin/analyticsController');

const router = Router();

// All admin routes require a valid JWT + admin role
router.use(authenticate, requireAdmin);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', dashboardCtrl.getDashboard);

// ── Games ─────────────────────────────────────────────────────────────────────
router.get('/games',          gameCtrl.listGames);
router.get('/games/:id',      gameCtrl.getGame);
router.post('/games',         gameCtrl.createGame);
router.patch('/games/:id',    gameCtrl.updateGame);
router.delete('/games/:id',   gameCtrl.deleteGame);

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories',         categoryCtrl.listCategories);
router.get('/categories/:id',     categoryCtrl.getCategory);
router.post('/categories',        categoryCtrl.createCategory);
router.patch('/categories/:id',   categoryCtrl.updateCategory);
router.delete('/categories/:id',  categoryCtrl.deleteCategory);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders',              orderCtrl.listOrders);
router.get('/orders/:id',          orderCtrl.getOrder);
router.patch('/orders/:id/status', orderCtrl.updateStatus);

// ── Payments ──────────────────────────────────────────────────────────────────
router.get('/payments',               paymentCtrl.listPayments);
router.get('/payments/:id',           paymentCtrl.getPayment);
router.post('/payments/:id/verify',   paymentCtrl.verifyPayment);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',                   userCtrl.listUsers);
router.get('/users/:id',               userCtrl.getUser);
router.patch('/users/:id/status',      userCtrl.updateStatus);
router.patch('/users/:id/role',        authenticate, requireSuperAdmin, userCtrl.updateRole);

// ── Invoices ──────────────────────────────────────────────────────────────────
router.get('/invoices',                       invoiceCtrl.listInvoices);
router.get('/invoices/:id',                   invoiceCtrl.getInvoice);
router.post('/invoices/:orderId/regenerate',  invoiceCtrl.regenerateInvoice);

// ── Receipts ──────────────────────────────────────────────────────────────────
router.get('/receipts',                         receiptCtrl.listReceipts);
router.get('/receipts/:id',                     receiptCtrl.getReceipt);
router.post('/receipts/:paymentId/regenerate',  receiptCtrl.regenerateReceipt);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics/overview', analyticsCtrl.getOverview);
router.get('/analytics/sales',    analyticsCtrl.getSales);
router.get('/analytics/orders',   analyticsCtrl.getOrders);
router.get('/analytics/users',    analyticsCtrl.getUsers);

module.exports = router;
