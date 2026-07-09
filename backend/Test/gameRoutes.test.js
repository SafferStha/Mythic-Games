const request = require('supertest');
const express = require('express');

// 🔥 MOCK DB
jest.mock('../database/db', () => ({
  query: jest.fn()
}));

// 🔥 MOCK AUTH
jest.mock('../middleware/authMiddleware', () => ({
  authenticateToken: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next()
}));

const db = require('../database/db');
const gameRoutesFactory = require('../routes/gameRoutes');

describe('Game Routes Tests', () => {

  let app;

  // 🔥 MOCK UPLOAD
  const mockUpload = {
    single: () => (req, res, next) => {
      req.file = { filename: 'game.jpg' };
      next();
    }
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/games', gameRoutesFactory(mockUpload));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ GET ALL GAMES
  test('GET /api/games should return all games', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/games');

    expect(res.statusCode).toBe(200);
  });

  // ✅ GET FILTERED GAMES
  test('GET /api/games with filters', async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get('/api/games?is_free=true');

    expect(res.statusCode).toBe(200);
  });

  // ✅ CREATE GAME
  test('POST /api/games should create game', async () => {
    db.query.mockResolvedValue({
      rows: [{ id: 1, title: 'Test Game' }]
    });

    const res = await request(app)
      .post('/api/games')
      .send({ title: 'Test Game', price: 10 });

    expect(res.statusCode).toBe(201);
  });

  // ✅ UPDATE GAME
  test('PUT /api/games/:id should update game', async () => {
    db.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1 }]
    });

    const res = await request(app)
      .put('/api/games/1')
      .send({ title: 'Updated Game' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ UPDATE GAME NOT FOUND
  test('PUT /api/games/:id should return 404 if not found', async () => {
    db.query.mockResolvedValue({
      rowCount: 0,
      rows: []
    });

    const res = await request(app)
      .put('/api/games/999')
      .send({ title: 'Not Exist' });

    expect(res.statusCode).toBe(404);
  });

  // ✅ DELETE GAME
  test('DELETE /api/games/:id should delete game', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/games/1');

    expect(res.statusCode).toBe(200);
  });

  // ✅ DELETE GAME NOT FOUND
  test('DELETE /api/games/:id should return 404', async () => {
    db.query.mockResolvedValue({ rowCount: 0 });

    const res = await request(app)
      .delete('/api/games/999');

    expect(res.statusCode).toBe(404);
  });

});