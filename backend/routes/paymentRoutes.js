const express = require("express");
const paymentController = require("../controller/paymentController");

const router = express.Router();

router.get("/admin", paymentController.getAdminPayments);
router.get("/user/:userId/history", paymentController.getUserPaymentHistory);
router.post("/checkout", paymentController.createCheckout);
router.post("/checkout/bulk", paymentController.createBulkCheckout);
router.post("/claim-free", paymentController.claimFreeGames);
router.put("/bulk/method", paymentController.updateBulkPaymentMethod);
router.post("/bulk/process", paymentController.processBulkPayment);
router.get("/:paymentId", paymentController.getPaymentDetails);
router.put("/:paymentId/method", paymentController.updatePaymentMethod);
router.post("/:paymentId/process", paymentController.processPayment);

module.exports = router;
