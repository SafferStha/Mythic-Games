const db = require("../db");
const gameModel = require("../model/gameModel");
const orderModel = require("../model/orderModel");
const paymentModel = require("../model/paymentModel");
const cartModel = require("../model/cartModel");

const PAYMENT_METHODS = new Set(["esewa", "khalti"]);
const FINAL_STATUSES = new Set(["PAID", "FAILED", "CANCELLED"]);

function formatPaymentMethod(paymentMethod) {
  return paymentMethod === "esewa" ? "eSewa" : "Khalti";
}

function generateTransactionId(paymentMethod) {
  const prefix = paymentMethod === "esewa" ? "ESW" : "KHL";
  const year = new Date().getFullYear();
  const randomPart = String(Math.floor(100000 + Math.random() * 900000));
  return `${prefix}-${year}-${randomPart}`;
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
    const game = await gameModel.findGameById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Selected game was not found.",
      });
    }

    const amount = Number(game.price || 0);
    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      const order = await orderModel.createOrder(
        { userId, gameId, amount },
        client,
      );
      const payment = await paymentModel.createPayment(
        {
          userId,
          gameId,
          amount,
          paymentMethod,
          orderId: order.id,
        },
        client,
      );

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Demo payment checkout created successfully.",
        data: {
          paymentId: payment.id,
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
          gatewayNotice: "Demo Payment Gateway - College Project Only",
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize demo payment checkout.",
    });
  }
}

async function processPayment(req, res) {
  const { paymentId } = req.params;
  const { userId, action } = req.body;

  const actionStatusMap = {
    success: "PAID",
    failed: "FAILED",
    cancel: "CANCELLED",
  };

  const nextStatus = actionStatusMap[action];

  if (!userId || !nextStatus) {
    return res.status(400).json({
      success: false,
      message: "userId and a valid action are required.",
    });
  }

  try {
    const existingPayment = await paymentModel.getPaymentById(
      paymentId,
      userId,
    );

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    if (FINAL_STATUSES.has(existingPayment.payment_status)) {
      return res.json({
        success: true,
        message: "Payment was already processed.",
        data: {
          ...existingPayment,
          payment_method_label: formatPaymentMethod(
            existingPayment.payment_method,
          ),
          gatewayNotice: "Demo Payment Gateway - College Project Only",
        },
      });
    }

    const transactionId =
      nextStatus === "PAID"
        ? generateTransactionId(existingPayment.payment_method)
        : null;

    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      await paymentModel.updatePaymentStatus(
        paymentId,
        nextStatus,
        transactionId,
        client,
      );
      await orderModel.updateOrderStatus(
        existingPayment.order_id,
        nextStatus,
        client,
      );

      if (nextStatus === "PAID") {
        await cartModel.removeGameFromCart(
          userId,
          existingPayment.game_id,
          client,
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const updatedPayment = await paymentModel.getPaymentById(paymentId, userId);

    return res.json({
      success: true,
      message:
        nextStatus === "PAID"
          ? "Demo payment completed successfully."
          : nextStatus === "FAILED"
            ? "Demo payment marked as failed."
            : "Demo payment was cancelled.",
      data: {
        ...updatedPayment,
        payment_method_label: formatPaymentMethod(
          updatedPayment.payment_method,
        ),
        gatewayNotice: "Demo Payment Gateway - College Project Only",
      },
    });
  } catch (error) {
    console.error("Process payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process demo payment.",
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
    const existingPayment = await paymentModel.getPaymentById(
      paymentId,
      userId,
    );

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    if (FINAL_STATUSES.has(existingPayment.payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Processed payments can no longer change method.",
      });
    }

    const updated = await paymentModel.updatePaymentMethod(
      paymentId,
      paymentMethod,
    );

    return res.json({
      success: true,
      message: "Payment method updated successfully.",
      data: {
        ...existingPayment,
        ...updated,
        payment_method: paymentMethod,
        payment_method_label: formatPaymentMethod(paymentMethod),
        gatewayNotice: "Demo Payment Gateway - College Project Only",
      },
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment method.",
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
      data: {
        ...payment,
        payment_method_label: formatPaymentMethod(payment.payment_method),
        gatewayNotice: "Demo Payment Gateway - College Project Only",
      },
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

module.exports = {
  createCheckout,
  processPayment,
  updatePaymentMethod,
  getPaymentDetails,
  getAdminPayments,
};
