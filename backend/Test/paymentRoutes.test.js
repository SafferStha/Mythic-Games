const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../routes/paymentRoutes');

// 🔥 MOCK CONTROLLER
jest.mock('../controller/paymentController', () => ({
  getAdminPayments: jest.fn((req, res) => res.json({ success: true })),
  getUserPaymentHistory: jest.fn((req, res) => res.json({ success: true })),
  createCheckout: jest.fn((req, res) => res.status(201).json({ success: true })),
  createBulkCheckout: jest.fn((req, res) => res.status(201).json({ success: true })),
  claimFreeGames: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateBulkPaymentMethod: jest.fn((req, res) => res.json({ success: true })),
  processBulkPayment: jest.fn((req, res) => res.json({ success: true })),
  getPaymentDetails: jest.fn((req, res) => res.json({ success: true })),
  updatePaymentMethod: jest.fn((req, res) => res.json({ success: true })),
  processPayment: jest.fn((req, res) => res.json({ success: true }))
}));

// 🔥 MOCK MIDDLEWARE
jest.mock('../middleware/authMiddleware', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'admin' }; // fake user
    next();
  },
  requireAdmin: (req, res, next) => next()
}));

describe('Payment Routes Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payment', paymentRoutes);
  });

  // ✅ TEST 1: Admin route
  test('GET /admin should return success', async () => {
    const res = await request(app).get('/api/payment/admin');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ✅ TEST 2: User payment history
  test('GET /user/:userId/history', async () => {
    const res = await request(app).get('/api/payment/user/1/history');
    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 3: Checkout
  test('POST /checkout', async () => {
    const res = await request(app)
      .post('/api/payment/checkout')
      .send({ userId: 1, gameId: 10, paymentMethod: 'esewa' });

    expect(res.statusCode).toBe(201);
  });

  // ✅ TEST 4: Bulk checkout
  test('POST /checkout/bulk', async () => {
    const res = await request(app)
      .post('/api/payment/checkout/bulk')
      .send({ userId: 1, gameIds: [1, 2], paymentMethod: 'khalti' });

    expect(res.statusCode).toBe(201);
  });

  // ✅ TEST 5: Claim free games
  test('POST /claim-free', async () => {
    const res = await request(app)
      .post('/api/payment/claim-free')
      .send({ userId: 1, gameIds: [1] });

    expect(res.statusCode).toBe(201);
  });

  // ✅ TEST 6: Get payment details
  test('GET /:paymentId', async () => {
    const res = await request(app).get('/api/payment/1?userId=1');
    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 7: Update payment method
  test('PUT /:paymentId/method', async () => {
    const res = await request(app)
      .put('/api/payment/1/method')
      .send({ userId: 1, paymentMethod: 'esewa' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 8: Process payment
  test('POST /:paymentId/process', async () => {
    const res = await request(app)
      .post('/api/payment/1/process')
      .send({ userId: 1, action: 'success' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 9: Bulk process
  test('POST /bulk/process', async () => {
    const res = await request(app)
      .post('/api/payment/bulk/process')
      .send({ userId: 1, paymentIds: [1, 2], action: 'success' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 10: Bulk method update
  test('PUT /bulk/method', async () => {
    const res = await request(app)
      .put('/api/payment/bulk/method')
      .send({ userId: 1, paymentIds: [1], paymentMethod: 'khalti' });

    expect(res.statusCode).toBe(200);
  });

});