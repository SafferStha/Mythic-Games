const request = require('supertest');
const express = require('express');

// 🔥 MOCK CONTROLLER
jest.mock('../controller/newsController', () => ({
  getNews: jest.fn((req, res) => res.json({ success: true })),
  createNews: jest.fn((req, res) => res.status(201).json({ success: true })),
  updateNews: jest.fn((req, res) => res.json({ success: true })),
  deleteNews: jest.fn((req, res) => res.json({ success: true }))
}));

// 🔥 MOCK AUTH MIDDLEWARE
jest.mock('../middleware/authMiddleware', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  requireAdmin: (req, res, next) => next()
}));

const newsRoutesFactory = require('../routes/newsRoutes');

describe('News Routes Tests', () => {

  let app;

  // 🔥 FAKE UPLOAD (multer mock)
  const mockUpload = {
    single: () => (req, res, next) => {
      req.file = { filename: 'test.jpg' }; // simulate uploaded file
      next();
    }
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // inject mock upload into routes
    app.use('/api/news', newsRoutesFactory(mockUpload));
  });

  // ✅ TEST 1: GET news
  test('GET /api/news should return news', async () => {
    const res = await request(app).get('/api/news');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ✅ TEST 2: CREATE news
  test('POST /api/news should create news', async () => {
    const res = await request(app)
      .post('/api/news')
      .send({ title: 'Test News' });

    expect(res.statusCode).toBe(201);
  });

  // ✅ TEST 3: UPDATE news
  test('PUT /api/news/:id should update news', async () => {
    const res = await request(app)
      .put('/api/news/1')
      .send({ title: 'Updated News' });

    expect(res.statusCode).toBe(200);
  });

  // ✅ TEST 4: DELETE news
  test('DELETE /api/news/:id should delete news', async () => {
    const res = await request(app).delete('/api/news/1');
    expect(res.statusCode).toBe(200);
  });

});