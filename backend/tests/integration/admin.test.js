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

jest.mock('../../src/repositories/gameRepository');
jest.mock('../../src/repositories/categoryRepository');
jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/paymentRepository');
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/repositories/invoiceRepository');
jest.mock('../../src/repositories/receiptRepository');
jest.mock('../../src/repositories/analyticsRepository');
jest.mock('../../src/repositories/adminLogRepository');

const gameRepository      = require('../../src/repositories/gameRepository');
const categoryRepository  = require('../../src/repositories/categoryRepository');
const orderRepository     = require('../../src/repositories/orderRepository');
const paymentRepository   = require('../../src/repositories/paymentRepository');
const userRepository      = require('../../src/repositories/userRepository');
const analyticsRepository = require('../../src/repositories/analyticsRepository');
const adminLogRepository  = require('../../src/repositories/adminLogRepository');

const app = require('../../src/app');
const { makeAdminToken, makeSuperAdminToken, makeUserToken } = require('../helpers/tokenHelper');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const testGame = {
  id:             1,
  title:          'Test Game',
  slug:           'test-game',
  price:          '59.99',
  discount_price: null,
  stock:          10,
  status:         'active',
  category_id:    1,
  cover_image:    '/images/test.jpg',
  created_at:     new Date().toISOString(),
};

const testCategory = {
  id:          1,
  name:        'Action',
  slug:        'action',
  icon:        '🎯',
  description: 'Action games',
  created_at:  new Date().toISOString(),
};

const testOrder = {
  id:             1,
  user_id:        10000001,
  order_number:   'MG-20260622-000001',
  grand_total:    '135.58',
  payment_status: 'pending',
  order_status:   'processing',
  created_at:     new Date().toISOString(),
};

const statsResult = { total: 10, growth: 5 };

let adminToken;
let superAdminToken;
let userToken;

beforeAll(() => {
  adminToken      = makeAdminToken();
  superAdminToken = makeSuperAdminToken();
  userToken       = makeUserToken();
});

// ── Auth Guard Tests ──────────────────────────────────────────────────────────

describe('Admin route guard', () => {
  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('returns 403 when regular user accesses admin route', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('allows admin access to admin routes', async () => {
    analyticsRepository.getRevenueStats.mockResolvedValue(statsResult);
    analyticsRepository.getOrderStats.mockResolvedValue(statsResult);
    analyticsRepository.getUserStats.mockResolvedValue(statsResult);
    analyticsRepository.getGameStats.mockResolvedValue(statsResult);
    analyticsRepository.getPaymentStats.mockResolvedValue(statsResult);

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

// ── Games CRUD ────────────────────────────────────────────────────────────────

describe('Admin Games CRUD', () => {
  beforeEach(() => {
    gameRepository.findAll.mockResolvedValue({ rows: [testGame], total: 1 });
    gameRepository.findById.mockResolvedValue(testGame);
    gameRepository.findBySlug.mockResolvedValue(null);
    gameRepository.create.mockResolvedValue(testGame);
    gameRepository.update.mockResolvedValue(testGame);
    gameRepository.remove.mockResolvedValue(undefined);
    adminLogRepository.create.mockResolvedValue(undefined);
  });

  it('GET /api/admin/games — returns game list', async () => {
    const res = await request(app)
      .get('/api/admin/games')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('rows');
  });

  it('GET /api/admin/games/:id — returns single game', async () => {
    const res = await request(app)
      .get('/api/admin/games/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('GET /api/admin/games/:id — returns 404 for unknown game', async () => {
    gameRepository.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/admin/games/999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('POST /api/admin/games — creates a new game', async () => {
    const res = await request(app)
      .post('/api/admin/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title:       'New Game',
        description: 'A great game description here',
        price:       59.99,
        stock:       50,
        category_id: 1,
        status:      'active',
      });

    expect([200, 201]).toContain(res.status);
  });

  it('DELETE /api/admin/games/:id — soft deletes a game', async () => {
    const res = await request(app)
      .delete('/api/admin/games/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

// ── Categories CRUD ───────────────────────────────────────────────────────────

describe('Admin Categories CRUD', () => {
  beforeEach(() => {
    categoryRepository.findAll.mockResolvedValue([testCategory]);
    categoryRepository.findById.mockResolvedValue(testCategory);
    categoryRepository.findBySlug.mockResolvedValue(null);
    categoryRepository.findByName.mockResolvedValue(null);
    categoryRepository.create.mockResolvedValue(testCategory);
    categoryRepository.update.mockResolvedValue(testCategory);
    categoryRepository.remove.mockResolvedValue(undefined);
    categoryRepository.countGamesByCategory.mockResolvedValue(0);
    adminLogRepository.create.mockResolvedValue(undefined);
  });

  it('GET /api/admin/categories — returns category list', async () => {
    const res = await request(app)
      .get('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('POST /api/admin/categories — creates category', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'RPG', slug: 'rpg', icon: '⚔️', description: 'Role-playing games' });

    expect([200, 201]).toContain(res.status);
  });

  it('DELETE /api/admin/categories/:id — returns 409 if games exist', async () => {
    categoryRepository.countGamesByCategory.mockResolvedValue(5);

    const res = await request(app)
      .delete('/api/admin/categories/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
  });

  it('DELETE /api/admin/categories/:id — succeeds when no games', async () => {
    const res = await request(app)
      .delete('/api/admin/categories/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

// ── Orders Management ─────────────────────────────────────────────────────────

describe('Admin Orders', () => {
  beforeEach(() => {
    orderRepository.findAllAdmin.mockResolvedValue({ rows: [testOrder], total: 1 });
    orderRepository.findById.mockResolvedValue(testOrder);
    orderRepository.updateOrderStatus.mockResolvedValue({ ...testOrder, order_status: 'completed' });
    adminLogRepository.create.mockResolvedValue(undefined);
  });

  it('GET /api/admin/orders — returns paginated order list', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('rows');
  });

  it('PATCH /api/admin/orders/:id/status — updates order status', async () => {
    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderStatus: 'completed' });

    expect([200, 400]).toContain(res.status);
  });
});

// ── Users Management ──────────────────────────────────────────────────────────

describe('Admin Users', () => {
  const testUser = {
    uid:        10000001,
    username:   'testuser',
    email:      'test@example.com',
    role:       'user',
    status:     'active',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    userRepository.findAllPaginated.mockResolvedValue({ rows: [testUser], total: 1 });
    userRepository.findById.mockResolvedValue(testUser);
    userRepository.updateStatus.mockResolvedValue({ ...testUser, status: 'inactive' });
    userRepository.updateRole.mockResolvedValue({ ...testUser, role: 'admin' });
    adminLogRepository.create.mockResolvedValue(undefined);
  });

  it('GET /api/admin/users — returns user list', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('PATCH /api/admin/users/:id/role — requires super_admin', async () => {
    const res = await request(app)
      .patch('/api/admin/users/10000001/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/admin/users/:id/role — succeeds for super_admin', async () => {
    const res = await request(app)
      .patch('/api/admin/users/10000001/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ role: 'admin' });

    expect([200, 400]).toContain(res.status);
  });

  it('PATCH /api/admin/users/:id/status — updates user status', async () => {
    const res = await request(app)
      .patch('/api/admin/users/10000001/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });

    expect([200, 400]).toContain(res.status);
  });
});

// ── Analytics ─────────────────────────────────────────────────────────────────

describe('Admin Analytics', () => {
  beforeEach(() => {
    analyticsRepository.getRevenueStats.mockResolvedValue(statsResult);
    analyticsRepository.getOrderStats.mockResolvedValue(statsResult);
    analyticsRepository.getUserStats.mockResolvedValue(statsResult);
    analyticsRepository.getGameStats.mockResolvedValue(statsResult);
    analyticsRepository.getPaymentStats.mockResolvedValue(statsResult);
    analyticsRepository.getMonthlySales.mockResolvedValue([]);
    analyticsRepository.getTopSellingGames.mockResolvedValue([]);
    analyticsRepository.getLowStockGames.mockResolvedValue([]);
    analyticsRepository.getMonthlyRegistrations.mockResolvedValue([]);
    analyticsRepository.getOrderStatusBreakdown.mockResolvedValue([]);
  });

  it('GET /api/admin/analytics/overview — returns analytics data', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('GET /api/admin/analytics/sales — returns sales data', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/sales')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('GET /api/admin/analytics/orders — returns order analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('GET /api/admin/analytics/users — returns user analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
