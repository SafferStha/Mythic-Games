'use strict';

const request = require('supertest');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/config/database', () => ({
  pool: {
    connect: jest.fn(),
    query:   jest.fn(),
    end:     jest.fn(),
  },
}));

jest.mock('../../src/database/migrations', () => ({
  runMigrations:     jest.fn().mockResolvedValue(undefined),
  getConnectionInfo: jest.fn().mockResolvedValue({ database: 'test', host: 'localhost', port: 5432 }),
}));

jest.mock('../../src/repositories/cartRepository');
jest.mock('../../src/repositories/cartItemRepository');
jest.mock('../../src/repositories/gameRepository');
jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/orderItemRepository');

const cartRepository     = require('../../src/repositories/cartRepository');
const cartItemRepository = require('../../src/repositories/cartItemRepository');
const gameRepository     = require('../../src/repositories/gameRepository');
const orderRepository    = require('../../src/repositories/orderRepository');
const orderItemRepository = require('../../src/repositories/orderItemRepository');

const { pool } = require('../../src/config/database');

const app = require('../../src/app');
const { makeUserToken } = require('../helpers/tokenHelper');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testCart = {
  id:         1,
  user_id:    10000001,
  status:     'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const testCartItems = [
  {
    id:                  1,
    cart_id:             1,
    game_id:             1,
    quantity:            2,
    unit_price:          '59.99',
    subtotal:            '119.98',
    game_title:          'Test Game',
    game_slug:           'test-game',
    game_cover_image:    '/images/test.jpg',
    game_current_price:  '59.99',
    game_discount_price: null,
    game_stock:          10,
    game_status:         'active',
  },
];

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
};

// The DB transaction client mock — reused across tests
function makeMockClient() {
  return {
    query:   jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn(),
  };
}

let authToken;

beforeAll(() => {
  authToken = makeUserToken();
});

// ── POST /api/checkout ────────────────────────────────────────────────────────

describe('POST /api/checkout', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/checkout');
    expect(res.status).toBe(401);
  });

  it('returns 400 when no active cart exists', async () => {
    const mockClient = makeMockClient();
    pool.connect.mockResolvedValue(mockClient);
    cartRepository.findActiveByUserId.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('NO_ACTIVE_CART');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('returns 400 when cart has no items', async () => {
    const mockClient = makeMockClient();
    pool.connect.mockResolvedValue(mockClient);
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CART_EMPTY');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('returns 400 when a game is out of stock', async () => {
    const mockClient = makeMockClient();
    pool.connect.mockResolvedValue(mockClient);
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([
      { ...testCartItems[0], game_stock: 1, quantity: 5 },
    ]);

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CART_VALIDATION_FAILED');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('returns 400 when a game is inactive', async () => {
    const mockClient = makeMockClient();
    pool.connect.mockResolvedValue(mockClient);
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([
      { ...testCartItems[0], game_status: 'inactive' },
    ]);

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CART_VALIDATION_FAILED');
  });

  it('creates an order successfully with valid cart', async () => {
    const mockClient = makeMockClient();
    pool.connect.mockResolvedValue(mockClient);
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue(testCartItems);
    orderRepository.create.mockResolvedValue(testOrder);
    orderItemRepository.bulkCreate.mockResolvedValue([]);
    gameRepository.decrementStock.mockResolvedValue({ id: 1, stock: 8 });
    cartRepository.updateStatus.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('order');
    expect(res.body.data.order.order_number).toBe('MG-20260622-000001');
    expect(res.body.data.payment_pending).toBe(true);
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('rolls back on stock exhaustion during checkout', async () => {
    const mockClient = makeMockClient();
    pool.connect.mockResolvedValue(mockClient);
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue(testCartItems);
    orderRepository.create.mockResolvedValue(testOrder);
    orderItemRepository.bulkCreate.mockResolvedValue([]);
    gameRepository.decrementStock.mockResolvedValue(null); // stock exhausted!
    cartRepository.updateStatus.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('STOCK_DEPLETED');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
