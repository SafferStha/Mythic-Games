const authController = require('../controller/authController');
const userModel = require('../model/userModel');
const adminModel = require('../model/adminModel');
const otpModel = require('../model/otpModel');
const emailService = require('../service/emailService');
const bcrypt = require('bcrypt');

// ✅ Mock all dependencies
jest.mock('../model/userModel');
jest.mock('../model/adminModel');
jest.mock('../model/otpModel');
jest.mock('../service/emailService');
jest.mock('bcrypt');

describe('Auth Controller Tests', () => {

  // ✅ Runs after every test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST 1
  test('register should return 400 if fields missing', async () => {
    const req = { body: {} };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 2
  test('register should create user successfully', async () => {
    const req = {
      body: {
        username: 'ram',
        email: 'ram@test.com',
        password: '123456'
      }
    };

    userModel.getUserByEmailOrUsername.mockResolvedValue(null);
    adminModel.getAdminByEmailOrUsername.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedPassword');

    userModel.createUser.mockResolvedValue({
      username: 'ram',
      email: 'ram@test.com'
    });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ✅ TEST 3
  test('login should return 400 if input missing', async () => {
    const req = { body: {} };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 4
  test('login should return 401 if user not found', async () => {
    const req = {
      body: {
        identifier: 'test@test.com',
        password: '123456'
      }
    };

    adminModel.findAdminByLoginIdentifier.mockResolvedValue(null);
    userModel.findUserByLoginIdentifier.mockResolvedValue(null);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ✅ TEST 5
  test('forgotPassword should return 400 if email missing', async () => {
    const req = { body: {} };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});