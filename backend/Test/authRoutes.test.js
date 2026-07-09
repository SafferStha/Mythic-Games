const request = require('supertest');
const app = require('../server');

describe('Auth API Tests', () => {

  test('POST /api/auth/register should return 400 if empty', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/login should return 400 if empty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
  });

});