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
jest.mock('../../src/repositories/orderItemRepository');

const orderRepository     = require('../../src/repositories/orderRepository');
const orderItemRepository = require('../../src/repositories/orderItemRepository');

const app = require('../../src/app');
const { makeUserToken } = require('../helpers/tokenHelper');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testOrder = {
  id:             1,
  user_id:        10000001,
  cart_id:        1,
  order_number:   'MG-20260622-000001',
  subtotal:       '119.98',
  tax:            '15.60',
  discount:       '0.00',
  grand_total:    '135.58',
  payment_status: 'pending',
  order_status:   'processing',
  created_at:     new Date().toISOString(),
  updated_at:     new Date().toISOString(),
};

const testOrderItem = {
  id:         1,
  order_id:   1,
  game_id:    1,
  game_title: 'Test Game',
  quantity:   2,
  price:      '59.99',
  subtotal:   '119.98',
};

let authToken;

beforeAll(() => {
  authToken = makeUserToken();
});

// ── GET /api/orders ───────────────────────────────────────────────────────────

describe('GET /api/orders', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns empty array when user has no orders', async () => {
    orderRepository.findByUserId.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orders).toEqual([]);
  });

  it('returns user orders with correct shape', async () => {
    orderRepository.findByUserId.mockResolvedValue([testOrder]);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(1);
    expect(res.body.data.orders[0].order_number).toBe('MG-20260622-000001');
  });

  it('passes paymentStatus filter to repository', async () => {
    orderRepository.findByUserId.mockResolvedValue([]);

    await request(app)
      .get('/api/orders?paymentStatus=paid')
      .set('Authorization', `Bearer ${authToken}`);

    expect(orderRepository.findByUserId).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ paymentStatus: 'paid' })
    );
  });

  it('passes orderStatus filter to repository', async () => {
    orderRepository.findByUserId.mockResolvedValue([]);

    await request(app)
      .get('/api/orders?orderStatus=completed')
      .set('Authorization', `Bearer ${authToken}`);

    expect(orderRepository.findByUserId).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ orderStatus: 'completed' })
    );
  });
});

// ── GET /api/orders/:orderId ──────────────────────────────────────────────────

describe('GET /api/orders/:orderId', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent order', async () => {
    orderRepository.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/orders/999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('ORDER_NOT_FOUND');
  });

  it('returns 403 when order belongs to another user', async () => {
    orderRepository.findById.mockResolvedValue({ ...testOrder, user_id: 99999 });

    const res = await request(app)
      .get('/api/orders/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ORDER_ACCESS_DENIED');
  });

  it('returns order with items for the owner', async () => {
    orderRepository.findById.mockResolvedValue(testOrder);
    orderItemRepository.findByOrderId.mockResolvedValue([testOrderItem]);

    const res = await request(app)
      .get('/api/orders/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.order.order_number).toBe('MG-20260622-000001');
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].game_title).toBe('Test Game');
  });

  it('returns order with empty items array when no items exist', async () => {
    orderRepository.findById.mockResolvedValue(testOrder);
    orderItemRepository.findByOrderId.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/orders/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });
});
