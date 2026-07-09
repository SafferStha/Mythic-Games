const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST 1: No token
  test('should return 401 if no token provided', () => {
    const req = {
      headers: {}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ✅ TEST 2: Invalid token
  test('should return 403 if token is invalid', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalidtoken'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    // Simulate jwt error
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  // ✅ TEST 3: Valid token
  test('should call next() if token is valid', () => {
    const req = {
      headers: {
        authorization: 'Bearer validtoken'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, { id: 1, role: 'user' });
    });

    authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  // ✅ TEST 4: requireAdmin - no user
  test('should return 401 if user not set', () => {
    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ✅ TEST 5: requireAdmin - not admin
  test('should return 403 if user is not admin', () => {
    const req = {
      user: { role: 'user' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  // ✅ TEST 6: requireAdmin - admin access
  test('should call next() if user is admin', () => {
    const req = {
      user: { role: 'admin' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});