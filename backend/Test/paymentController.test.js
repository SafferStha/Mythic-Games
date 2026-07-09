const paymentController = require('../controller/paymentController');

// 🔥 MOCK ALL MODELS
jest.mock('../model/paymentModel');
jest.mock('../model/orderModel');
jest.mock('../model/gameModel');
jest.mock('../model/cartModel');
jest.mock('../model/libraryModel');
jest.mock('../database/db', () => ({
  pool: {
    connect: jest.fn()
  }
}));

const paymentModel = require('../model/paymentModel');
const gameModel = require('../model/gameModel');
const db = require('../database/db');

describe('Payment Controller Tests', () => {

  let req, res, client;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    client = {
      query: jest.fn(),
      release: jest.fn()
    };

    db.pool.connect.mockResolvedValue(client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST 1: createCheckout - missing fields
  test('should return 400 if required fields missing', async () => {
    req.body = {};

    await paymentController.createCheckout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 2: createCheckout - success
  test('should create checkout successfully', async () => {
    req.body = {
      userId: 1,
      gameId: 10,
      paymentMethod: 'esewa'
    };

    gameModel.findGameById.mockResolvedValue({
      id: 10,
      title: 'Game X',
      price: 100
    });

    const orderModel = require('../model/orderModel');
    orderModel.createOrder = jest.fn().mockResolvedValue({ id: 1 });

    paymentModel.createPayment.mockResolvedValue({
      id: 5,
      payment_status: 'PENDING'
    });

    await paymentController.createCheckout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  // ✅ TEST 3: processPayment - invalid input
  test('should return 400 for invalid processPayment input', async () => {
    req.params = { paymentId: 1 };
    req.body = { userId: null, action: null };

    await paymentController.processPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 4: processPayment - already processed
  test('should return already processed message', async () => {
    req.params = { paymentId: 1 };
    req.body = { userId: 1, action: 'success' };

    paymentModel.getPaymentById.mockResolvedValue({
      id: 1,
      payment_status: 'PAID'
    });

    await paymentController.processPayment(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining('already processed')
      })
    );
  });

  // ✅ TEST 5: getPaymentDetails - missing userId
  test('should return 400 if userId missing', async () => {
    req.params = { paymentId: 1 };
    req.query = {};

    await paymentController.getPaymentDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 6: getPaymentDetails - not found
  test('should return 404 if payment not found', async () => {
    req.params = { paymentId: 1 };
    req.query = { userId: 1 };

    paymentModel.getPaymentById.mockResolvedValue(null);

    await paymentController.getPaymentDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ✅ TEST 7: getPaymentDetails - success
  test('should return payment details', async () => {
    req.params = { paymentId: 1 };
    req.query = { userId: 1 };

    paymentModel.getPaymentById.mockResolvedValue({
      id: 1,
      payment_method: 'esewa'
    });

    await paymentController.getPaymentDetails(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

  // ✅ TEST 8: getUserPaymentHistory - missing userId
  test('should return 400 if userId missing', async () => {
    req.params = {};

    await paymentController.getUserPaymentHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 9: getUserPaymentHistory - success
  test('should return user payment history', async () => {
    req.params = { userId: 1 };

    paymentModel.getUserPaymentHistory.mockResolvedValue([
      { id: 1, payment_method: 'esewa' }
    ]);

    await paymentController.getUserPaymentHistory(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

});