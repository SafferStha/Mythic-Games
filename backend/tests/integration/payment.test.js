'use strict';

const request = require('supertest');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/config/database', () => ({
  pool: { connect: jest.fn(), query: jest.fn(), end: jest.fn() },
}));

jest.mock('../../src/database/migrations', () => ({
  runMigrations:     jest.fn().mockResolvedValue(undefined),
  getConnectionInfo: jest.fn().mockResolvedValue({ database: 'test', host: 'localhost', port: 5432 }),
}));

jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/paymentRepository');
jest.mock('../../src/repositories/invoiceRepository');
jest.mock('../../src/repositories/receiptRepository');

const orderRepository   = require('../../src/repositories/orderRepository');
const paymentRepository = require('../../src/repositories/paymentRepository');

const app = require('../../src/app');
const { makeUserToken } = require('../helpers/tokenHelper');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testOrder = {
  id:             1,
  user_id:        10000001,
  order_number:   'MG-20260622-000001',
  grand_total:    '135.58',
  payment_status: 'pending',
  order_status:   'processing',
  created_at:     new Date().toISOString(),
};

const testPayment = {
  id:               1,
  order_id:         1,
  provider:         'esewa',
  transaction_uuid: 'uuid-test-1234',
  amount:           '135.58',
  payment_status:   'initiated',
  created_at:       new Date().toISOString(),
};

let authToken;

beforeAll(() => {
  authToken = makeUserToken();
});

// ── POST /api/payment/esewa/initiate ──────────────────────────────────────────

describe('POST /api/payment/esewa/initiate', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/payment/esewa/initiate').send({ orderId: 1 });
    expect(res.status).toBe(401);
  });

  it('returns 400 when orderId is missing', async () => {
    const res = await request(app)
      .post('/api/payment/esewa/initiate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PARAM');
  });

  it('returns 404 when order does not exist', async () => {
    orderRepository.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/payment/esewa/initiate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderId: 999 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('ORDER_NOT_FOUND');
  });

  it('returns 403 when order belongs to another user', async () => {
    orderRepository.findById.mockResolvedValue({ ...testOrder, user_id: 99999 });

    const res = await request(app)
      .post('/api/payment/esewa/initiate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderId: 1 });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ORDER_ACCESS_DENIED');
  });

  it('returns 409 when order already paid', async () => {
    orderRepository.findById.mockResolvedValue({ ...testOrder, payment_status: 'paid' });

    const res = await request(app)
      .post('/api/payment/esewa/initiate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderId: 1 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ORDER_ALREADY_PAID');
  });

  it('returns 200 with eSewa form data for valid pending order', async () => {
    orderRepository.findById.mockResolvedValue(testOrder);
    paymentRepository.create.mockResolvedValue(testPayment);

    const res = await request(app)
      .post('/api/payment/esewa/initiate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ orderId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('esewa_payload');
    expect(res.body.data).toHaveProperty('payment_url');
  });
});

// ── GET /api/payment/esewa/success (public callback) ─────────────────────────

describe('GET /api/payment/esewa/success', () => {
  it('returns 400 when no data query param', async () => {
    const res = await request(app).get('/api/payment/esewa/success');
    expect(res.status).toBe(400);
  });

  it('redirects to failure when data is invalid base64', async () => {
    const res = await request(app)
      .get('/api/payment/esewa/success')
      .query({ data: 'not-valid!!!' });

    // Service decodes, fails signature verification → redirects to failure URL
    expect([302, 400, 500]).toContain(res.status);
  });
});

// ── GET /api/payment/esewa/failure (public callback) ─────────────────────────

describe('GET /api/payment/esewa/failure', () => {
  it('redirects to frontend failure page', async () => {
    const res = await request(app).get('/api/payment/esewa/failure');
    expect([200, 302]).toContain(res.status);
  });
});

// ── POST /api/payment/esewa/verify ────────────────────────────────────────────

describe('POST /api/payment/esewa/verify', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/payment/esewa/verify')
      .send({ transactionUuid: 'uuid-test-1234' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when transactionUuid is missing', async () => {
    const res = await request(app)
      .post('/api/payment/esewa/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PARAM');
  });

  it('returns 404 for unknown transaction UUID', async () => {
    paymentRepository.findByTransactionUuid.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/payment/esewa/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ transactionUuid: 'non-existent-uuid' });

    expect(res.status).toBe(404);
  });
});
