const express = require("express");
const paymentController = require("../controller/paymentController");

const router = express.Router();

router.get("/admin", paymentController.getAdminPayments);
router.post("/checkout", paymentController.createCheckout);
router.get("/:paymentId", paymentController.getPaymentDetails);
router.put("/:paymentId/method", paymentController.updatePaymentMethod);
router.post("/:paymentId/process", paymentController.processPayment);

module.exports = router;
