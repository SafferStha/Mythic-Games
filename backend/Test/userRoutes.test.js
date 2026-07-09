const request = require('supertest');
const express = require('express');

// 🔥 MOCK DATABASE
jest.mock('../database/db', () => ({
  query: jest.fn()
}));

// 🔥 MOCK LIBRARY MODEL
jest.mock('../model/libraryModel', () => ({
  getUserLibrary: jest.fn(),
  updateInstallStatus: jest.fn()
}));

// 🔥 MOCK AUTH MIDDLEWARE
jest.mock('../middleware/authMiddleware', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  requireAdmin: (req, res, next) => next()
}));

const db = require('../database/db');
const libraryModel = require('../model/libraryModel');
const userRoutesFactory = require('../routes/userRoutes');

describe('User Routes Tests', () => {

  let app;

  // 🔥 MOCK UPLOAD (multer)
  const mockUpload = {
    single: () => (req, res, next) => {
      req.file = { filename: 'test.jpg' };
      next();
    }
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutesFactory(mockUpload));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ REGISTER
  test('POST /register should create user', async () => {
    db.query.mockResolvedValue({
      rows: [{ uid: 1, username: 'test', email: 'test@mail.com' }]
    });

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'test', email: 'test@mail.com', password: '123456' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ✅ LOGIN SUCCESS
  test('POST /login should login user', async () => {
    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    db.query.mockResolvedValue({
      rows: [{ uid: 1, username: 'test', email: 'test@mail.com', password: 'hashed', status: 'active' }]
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@mail.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ✅ GET USER
  test('GET /:uid should return user', async () => {
    db.query.mockResolvedValue({
      rows: [{ uid: 1, username: 'test' }]
    });

    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(200);
  });

  // ✅ UPDATE PROFILE
  test('PUT /:uid/profile should update profile', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ status: 'active' }] }) // requireActiveUser
      .mockResolvedValueOnce({ rows: [{ uid: 1 }] }); // update

    const res = await request(app)
      .put('/api/users/1/profile')
      .send({ username: 'new', email: 'new@mail.com', bio: 'bio' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ GET CART
  test('GET /:uid/cart should return cart', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ status: 'active' }] }) // active check
      .mockResolvedValueOnce({ rows: [] }); // cart

    const res = await request(app).get('/api/users/1/cart');
    expect(res.statusCode).toBe(200);
  });

  // ✅ ADD TO CART
  test('POST /:uid/cart should add item', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ status: 'active' }] }) // active check
      .mockResolvedValueOnce({}); // insert

    const res = await request(app)
      .post('/api/users/1/cart')
      .send({ gameId: 10 });

    expect(res.statusCode).toBe(201);
  });

  // ✅ GET LIBRARY
  test('GET /:uid/library should return library', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ status: 'active' }] });

    libraryModel.getUserLibrary.mockResolvedValue([]);

    const res = await request(app).get('/api/users/1/library');
    expect(res.statusCode).toBe(200);
  });

  // ✅ UPDATE INSTALL STATUS
  test('PUT /:uid/library/:gameId should update install status', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ status: 'active' }] });

    libraryModel.updateInstallStatus.mockResolvedValue({});

    const res = await request(app)
      .put('/api/users/1/library/10')
      .send({ installStatus: 'INSTALLED' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ GET WISHLIST
  test('GET /:uid/wishlist should return wishlist', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ status: 'active' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/users/1/wishlist');
    expect(res.statusCode).toBe(200);
  });

  // ✅ ADMIN GET USERS
  test('GET /admin/users should return users', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/users/admin/users');
    expect(res.statusCode).toBe(200);
  });

});