const db = require("../database/db");
const gameModel = require("../model/gameModel");
const orderModel = require("../model/orderModel");
const paymentModel = require("../model/paymentModel");
const cartModel = require("../model/cartModel");
const libraryModel = require("../model/libraryModel");

const PAYMENT_METHODS = new Set(["esewa", "khalti"]);
const FINAL_STATUSES = new Set(["PAID", "FAILED", "CANCELLED"]);
const ACTION_STATUS_MAP = {
  success: "PAID",
  failed: "FAILED",
  cancel: "CANCELLED",
};

function formatPaymentMethod(paymentMethod) {
  if (paymentMethod === "esewa") return "eSewa";
  if (paymentMethod === "khalti") return "Khalti";
  if (paymentMethod === "free") return "Free";
  return paymentMethod;
}

function generateTransactionId(paymentMethod) {
  const prefix =
    paymentMethod === "esewa"
      ? "ESW"
      : paymentMethod === "khalti"
        ? "KHL"
        : "FREE";
  const year = new Date().getFullYear();
  const randomPart = String(Math.floor(100000 + Math.random() * 900000));
  return `${prefix}-${year}-${randomPart}`;
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeIdArray(rawIds) {
  const source = Array.isArray(rawIds) ? rawIds : [rawIds];

  return [
    ...new Set(
      source
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ];
}

function toPaymentResponse(payment) {
  return {
    ...payment,
    payment_method_label: formatPaymentMethod(payment.payment_method),
    gatewayNotice: "Demo Payment Gateway",
  };
}

function summarizePayments(payments) {
  const normalizedPayments = payments.map(toPaymentResponse);

  return {
    paymentIds: normalizedPayments.map((payment) => payment.id),
    itemCount: normalizedPayments.length,
    totalAmount: normalizedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    ),
    payment_method_label: normalizedPayments[0]
      ? formatPaymentMethod(normalizedPayments[0].payment_method)
      : null,
    gatewayNotice: "Demo Payment Gateway",
    payments: normalizedPayments,
  };
}

async function getValidatedGames(gameIds) {
  const games = [];

  for (const gameId of gameIds) {
    const game = await gameModel.findGameById(gameId);

    if (!game) {
      throw createHttpError(
        404,
        `Selected game with ID ${gameId} was not found.`,
      );
    }

    games.push(game);
  }

  return games;
}

async function createCheckoutRecords({ userId, gameIds, paymentMethod }) {
  const games = await getValidatedGames(gameIds);
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const records = [];

    for (const game of games) {
      const amount = Number(game.price || 0);
      const order = await orderModel.createOrder(
        { userId, gameId: game.id, amount },
        client,
      );
      const payment = await paymentModel.createPayment(
        {
          userId,
          gameId: game.id,
          amount,
          paymentMethod,
          orderId: order.id,
        },
        client,
      );

      records.push({ game, order, payment, amount });
    }

    await client.query("COMMIT");
    return records;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function claimFreeGameRecords({ userId, gameIds }) {
  const games = await getValidatedGames(gameIds);
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const records = [];

    for (const game of games) {
      const amount = Number(game.price || 0);

      if (amount > 0) {
        throw createHttpError(
          400,
          `Game ${game.title} is not free and still requires payment.`,
        );
      }

      const order = await orderModel.createOrder(
        { userId, gameId: game.id, amount },
        client,
      );
      const payment = await paymentModel.createPayment(
        {
          userId,
          gameId: game.id,
          amount,
          paymentMethod: "free",
          orderId: order.id,
        },
        client,
      );

      await paymentModel.updatePaymentStatus(
        payment.id,
        "PAID",
        generateTransactionId("free"),
        client,
      );
      await orderModel.updateOrderStatus(order.id, "PAID", client);
      await libraryModel.addGameToLibrary(
        {
          userId,
          gameId: game.id,
          paymentId: payment.id,
        },
        client,
      );
      await cartModel.removeGameFromCart(userId, game.id, client);

      records.push({ game, order, paymentId: payment.id, amount });
    }

    await client.query("COMMIT");

    const payments = await Promise.all(
      records.map((record) =>
        paymentModel.getPaymentById(record.paymentId, userId),
      ),
    );

    return payments;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getValidatedPayments(paymentIds, userId) {
  const payments = [];

  for (const paymentId of paymentIds) {
    const payment = await paymentModel.getPaymentById(paymentId, userId);

    if (!payment) {
      throw createHttpError(404, `Payment record ${paymentId} was not found.`);
    }

    payments.push(payment);
  }

  return payments;
}

async function processPayments({ payments, userId, nextStatus }) {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    for (const payment of payments) {
      if (FINAL_STATUSES.has(payment.payment_status)) {
        throw createHttpError(
          400,
          "One or more selected payments have already been processed.",
        );
      }

      const transactionId =
        nextStatus === "PAID"
          ? generateTransactionId(payment.payment_method)
          : null;

      await paymentModel.updatePaymentStatus(
        payment.id,
        nextStatus,
        transactionId,
        client,
      );
      await orderModel.updateOrderStatus(payment.order_id, nextStatus, client);

      if (nextStatus === "PAID") {
        await libraryModel.addGameToLibrary(
          {
            userId,
            gameId: payment.game_id,
            paymentId: payment.id,
          },
          client,
        );

        await cartModel.removeGameFromCart(userId, payment.game_id, client);
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return Promise.all(
    payments.map((payment) => paymentModel.getPaymentById(payment.id, userId)),
  );
}

async function updatePaymentMethods({ payments, paymentMethod }) {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    for (const payment of payments) {
      if (FINAL_STATUSES.has(payment.payment_status)) {
        throw createHttpError(
          400,
          "Processed payments can no longer change method.",
        );
      }

      await paymentModel.updatePaymentMethod(payment.id, paymentMethod, client);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return Promise.all(
    payments.map((payment) =>
      paymentModel.getPaymentById(payment.id, payment.user_id),
    ),
  );
}

async function createCheckout(req, res) {
  const { userId, gameId, paymentMethod } = req.body;

  if (!userId || !gameId || !PAYMENT_METHODS.has(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "userId, gameId, and a valid paymentMethod are required.",
    });
  }

  try {
    const records = await createCheckoutRecords({
      userId,
      gameIds: [gameId],
      paymentMethod,
    });
    const [{ game, order, payment, amount }] = records;

    return res.status(201).json({
      success: true,
      message: "Demo payment checkout created successfully.",
      data: {
        paymentId: payment.id,
        paymentIds: [payment.id],
        orderId: order.id,
        paymentMethod,
        paymentMethodLabel: formatPaymentMethod(paymentMethod),
        paymentStatus: payment.payment_status,
        game: {
          id: game.id,
          title: game.title,
          image_url: game.image_url,
          game_type: game.game_type,
        },
        amount,
        gatewayNotice: "Demo Payment Gateway",
      },
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to initialize demo payment checkout.",
    });
  }
}

async function createBulkCheckout(req, res) {
  const { userId, gameIds, paymentMethod } = req.body;
  const normalizedGameIds = normalizeIdArray(gameIds);

  if (
    !userId ||
    normalizedGameIds.length === 0 ||
    !PAYMENT_METHODS.has(paymentMethod)
  ) {
    return res.status(400).json({
      success: false,
      message: "userId, gameIds, and a valid paymentMethod are required.",
    });
  }

  try {
    const records = await createCheckoutRecords({
      userId,
      gameIds: normalizedGameIds,
      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message: "Demo payment checkout created successfully.",
      data: {
        paymentId: records[0].payment.id,
        paymentIds: records.map((record) => record.payment.id),
        orderIds: records.map((record) => record.order.id),
        paymentMethod,
        paymentMethodLabel: formatPaymentMethod(paymentMethod),
        paymentStatus: "PENDING",
        itemCount: records.length,
        totalAmount: records.reduce(
          (sum, record) => sum + Number(record.amount || 0),
          0,
        ),
        items: records.map((record) => ({
          paymentId: record.payment.id,
          orderId: record.order.id,
          amount: record.amount,
          game: {
            id: record.game.id,
            title: record.game.title,
            image_url: record.game.image_url,
            game_type: record.game.game_type,
          },
        })),
        gatewayNotice: "Demo Payment Gateway",
      },
    });
  } catch (error) {
    console.error("Create bulk checkout error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to initialize demo payment checkout.",
    });
  }
}

async function claimFreeGames(req, res) {
  const { userId, gameIds } = req.body;
  const normalizedGameIds = normalizeIdArray(gameIds);

  if (!userId || normalizedGameIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "userId and gameIds are required.",
    });
  }

  try {
    const payments = await claimFreeGameRecords({
      userId,
      gameIds: normalizedGameIds,
    });

    return res.status(201).json({
      success: true,
      message: "Free games claimed successfully.",
      data: summarizePayments(payments),
    });
  } catch (error) {
    console.error("Claim free games error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to claim free games.",
    });
  }
}

async function processPayment(req, res) {
  const { paymentId } = req.params;
  const { userId, action } = req.body;
  const nextStatus = ACTION_STATUS_MAP[action];

  if (!userId || !nextStatus) {
    return res.status(400).json({
      success: false,
      message: "userId and a valid action are required.",
    });
  }

  try {
    const [existingPayment] = await getValidatedPayments([paymentId], userId);

    if (FINAL_STATUSES.has(existingPayment.payment_status)) {
      return res.json({
        success: true,
        message: "Payment was already processed.",
        data: toPaymentResponse(existingPayment),
      });
    }

    const [updatedPayment] = await processPayments({
      payments: [existingPayment],
      userId,
      nextStatus,
    });

    return res.json({
      success: true,
      message:
        nextStatus === "PAID"
          ? "Demo payment completed successfully."
          : nextStatus === "FAILED"
            ? "Demo payment marked as failed."
            : "Demo payment was cancelled.",
      data: toPaymentResponse(updatedPayment),
    });
  } catch (error) {
    console.error("Process payment error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process demo payment.",
    });
  }
}

async function processBulkPayment(req, res) {
  const { userId, paymentIds, action } = req.body;
  const normalizedPaymentIds = normalizeIdArray(paymentIds);
  const nextStatus = ACTION_STATUS_MAP[action];

  if (!userId || normalizedPaymentIds.length === 0 || !nextStatus) {
    return res.status(400).json({
      success: false,
      message: "userId, paymentIds, and a valid action are required.",
    });
  }

  try {
    const existingPayments = await getValidatedPayments(
      normalizedPaymentIds,
      userId,
    );
    const updatedPayments = await processPayments({
      payments: existingPayments,
      userId,
      nextStatus,
    });

    return res.json({
      success: true,
      message:
        nextStatus === "PAID"
          ? "Demo payments completed successfully."
          : nextStatus === "FAILED"
            ? "Demo payments marked as failed."
            : "Demo payments were cancelled.",
      data: summarizePayments(updatedPayments),
    });
  } catch (error) {
    console.error("Process bulk payment error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process demo payments.",
    });
  }
}

async function updatePaymentMethod(req, res) {
  const { paymentId } = req.params;
  const { userId, paymentMethod } = req.body;

  if (!userId || !PAYMENT_METHODS.has(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "userId and a valid paymentMethod are required.",
    });
  }

  try {
    const [existingPayment] = await getValidatedPayments([paymentId], userId);
    const [updatedPayment] = await updatePaymentMethods({
      payments: [existingPayment],
      paymentMethod,
    });

    return res.json({
      success: true,
      message: "Payment method updated successfully.",
      data: toPaymentResponse(updatedPayment),
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update payment method.",
    });
  }
}

async function updateBulkPaymentMethod(req, res) {
  const { userId, paymentIds, paymentMethod } = req.body;
  const normalizedPaymentIds = normalizeIdArray(paymentIds);

  if (
    !userId ||
    normalizedPaymentIds.length === 0 ||
    !PAYMENT_METHODS.has(paymentMethod)
  ) {
    return res.status(400).json({
      success: false,
      message: "userId, paymentIds, and a valid paymentMethod are required.",
    });
  }

  try {
    const existingPayments = await getValidatedPayments(
      normalizedPaymentIds,
      userId,
    );
    const updatedPayments = await updatePaymentMethods({
      payments: existingPayments,
      paymentMethod,
    });

    return res.json({
      success: true,
      message: "Payment methods updated successfully.",
      data: summarizePayments(updatedPayments),
    });
  } catch (error) {
    console.error("Update bulk payment method error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update payment methods.",
    });
  }
}

async function getPaymentDetails(req, res) {
  const { paymentId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required.",
    });
  }

  try {
    const payment = await paymentModel.getPaymentById(paymentId, userId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    return res.json({
      success: true,
      data: toPaymentResponse(payment),
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment details.",
    });
  }
}

async function getAdminPayments(req, res) {
  const { status = "ALL", search = "" } = req.query;

  try {
    const payments = await paymentModel.getAdminPayments({
      status: String(status).toUpperCase(),
      search: String(search).trim(),
    });

    return res.json({
      success: true,
      data: payments.map((payment) => ({
        ...payment,
        payment_method_label: formatPaymentMethod(payment.payment_method),
      })),
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment records.",
    });
  }
}

async function getUserPaymentHistory(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required.",
    });
  }

  try {
    const payments = await paymentModel.getUserPaymentHistory(userId);

    return res.json({
      success: true,
      data: payments.map((payment) => toPaymentResponse(payment)),
    });
  } catch (error) {
    console.error("User payment history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase history.",
    });
  }
}

module.exports = {
  createCheckout,
  createBulkCheckout,
  claimFreeGames,
  processPayment,
  processBulkPayment,
  updatePaymentMethod,
  updateBulkPaymentMethod,
  getPaymentDetails,
  getAdminPayments,
  getUserPaymentHistory,
};
