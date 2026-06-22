'use strict';

const request = require('supertest');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/config/database', () => ({
  pool: { connect: jest.fn(), query: jest.fn(), end: jest.fn() },
}));

jest.mock('../../src/database/migrations', () => ({
  runMigrations:    jest.fn().mockResolvedValue(undefined),
  getConnectionInfo: jest.fn().mockResolvedValue({ database: 'test', host: 'localhost', port: 5432 }),
}));

jest.mock('../../src/repositories/cartRepository');
jest.mock('../../src/repositories/cartItemRepository');
jest.mock('../../src/repositories/gameRepository');

const cartRepository     = require('../../src/repositories/cartRepository');
const cartItemRepository = require('../../src/repositories/cartItemRepository');
const gameRepository     = require('../../src/repositories/gameRepository');

const app = require('../../src/app');
const { makeUserToken } = require('../helpers/tokenHelper');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testGame = {
  id:             1,
  title:          'Test Game',
  slug:           'test-game',
  price:          '59.99',
  discount_price: null,
  stock:          10,
  status:         'active',
  cover_image:    '/images/test.jpg',
};

const testCart = {
  id:         1,
  user_id:    10000001,
  status:     'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const testCartItem = {
  id:          1,
  cart_id:     1,
  game_id:     1,
  quantity:    1,
  unit_price:  '59.99',
  subtotal:    '59.99',
  game_title:  'Test Game',
  game_slug:   'test-game',
  game_cover_image: '/images/test.jpg',
  game_current_price: '59.99',
  game_discount_price: null,
  game_stock:  10,
  game_status: 'active',
};

let authToken;

beforeAll(() => {
  authToken = makeUserToken();
});

// ── GET /api/cart ─────────────────────────────────────────────────────────────

describe('GET /api/cart', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('returns empty cart when no active cart exists', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.cart).toBeNull();
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.summary).toHaveProperty('grandTotal');
  });

  it('returns cart with items when active cart exists', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([testCartItem]);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.cart.id).toBe(1);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.summary).toHaveProperty('grandTotal');
  });
});

// ── POST /api/cart/add ────────────────────────────────────────────────────────

describe('POST /api/cart/add', () => {
  beforeEach(() => {
    gameRepository.findById.mockResolvedValue(testGame);
    cartRepository.findOrCreate.mockResolvedValue(testCart);
    cartItemRepository.findByCartAndGame.mockResolvedValue(null);
    cartItemRepository.create.mockResolvedValue(testCartItem);
    cartItemRepository.findByCartId.mockResolvedValue([testCartItem]);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/cart/add').send({ gameId: 1, quantity: 1 });
    expect(res.status).toBe(401);
  });

  it('adds a game to cart and returns 200', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameId: 1, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('returns 404 when game does not exist', async () => {
    gameRepository.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameId: 999, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('GAME_NOT_FOUND');
  });

  it('returns 400 for inactive game', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, status: 'inactive' });

    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameId: 1, quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('GAME_UNAVAILABLE');
  });

  it('returns 400 for insufficient stock', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, stock: 2 });

    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameId: 1, quantity: 5 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INSUFFICIENT_STOCK');
  });

  it('returns 400 when gameId is missing', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
  });

  it('increments quantity if game already in cart', async () => {
    cartItemRepository.findByCartAndGame.mockResolvedValue({ ...testCartItem, quantity: 1 });
    cartItemRepository.updateQuantity.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameId: 1, quantity: 1 });

    expect(res.status).toBe(200);
    expect(cartItemRepository.updateQuantity).toHaveBeenCalledWith(1, 2);
  });
});

// ── PATCH /api/cart/update/:cartItemId ────────────────────────────────────────

describe('PATCH /api/cart/update/:cartItemId', () => {
  beforeEach(() => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue({ ...testCartItem, cart_id: 1 });
    gameRepository.findById.mockResolvedValue(testGame);
    cartItemRepository.updateQuantity.mockResolvedValue(undefined);
    cartRepository.findById.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([testCartItem]);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).patch('/api/cart/update/1').send({ quantity: 2 });
    expect(res.status).toBe(401);
  });

  it('updates cart item quantity', async () => {
    const res = await request(app)
      .patch('/api/cart/update/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(cartItemRepository.updateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('returns 404 when cart item does not belong to user', async () => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/cart/update/999')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('CART_ITEM_NOT_FOUND');
  });

  it('returns 400 when quantity exceeds stock', async () => {
    gameRepository.findById.mockResolvedValue({ ...testGame, stock: 3 });

    const res = await request(app)
      .patch('/api/cart/update/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INSUFFICIENT_STOCK');
  });
});

// ── DELETE /api/cart/remove/:cartItemId ───────────────────────────────────────

describe('DELETE /api/cart/remove/:cartItemId', () => {
  beforeEach(() => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue({ ...testCartItem, cart_id: 1 });
    cartItemRepository.remove.mockResolvedValue(undefined);
    cartRepository.findById.mockResolvedValue(testCart);
    cartItemRepository.findByCartId.mockResolvedValue([]);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/cart/remove/1');
    expect(res.status).toBe(401);
  });

  it('removes cart item and returns 200', async () => {
    const res = await request(app)
      .delete('/api/cart/remove/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(cartItemRepository.remove).toHaveBeenCalledWith(1);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('returns 404 for non-owned item', async () => {
    cartItemRepository.findByIdAndUserId.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/cart/remove/999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/cart/clear ────────────────────────────────────────────────────

describe('DELETE /api/cart/clear', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/cart/clear');
    expect(res.status).toBe(401);
  });

  it('returns empty cart when no active cart exists', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/cart/clear')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.cart).toBeNull();
    expect(res.body.data.items).toEqual([]);
  });

  it('clears all items from active cart', async () => {
    cartRepository.findActiveByUserId.mockResolvedValue(testCart);
    cartItemRepository.clearByCartId.mockResolvedValue(undefined);
    cartItemRepository.findByCartId.mockResolvedValue([]);

    const res = await request(app)
      .delete('/api/cart/clear')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(cartItemRepository.clearByCartId).toHaveBeenCalledWith(1);
    expect(res.body.data.items).toHaveLength(0);
  });
});
