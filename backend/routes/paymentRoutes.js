const express = require("express");
const paymentController = require("../controller/paymentController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin", authenticateToken, requireAdmin, paymentController.getAdminPayments);
router.get("/user/:userId/history", authenticateToken, paymentController.getUserPaymentHistory);
router.post("/checkout", authenticateToken, paymentController.createCheckout);
router.post("/checkout/bulk", authenticateToken, paymentController.createBulkCheckout);
router.post("/claim-free", authenticateToken, paymentController.claimFreeGames);
router.put("/bulk/method", authenticateToken, paymentController.updateBulkPaymentMethod);
router.post("/bulk/process", authenticateToken, paymentController.processBulkPayment);
router.get("/:paymentId", authenticateToken, paymentController.getPaymentDetails);
router.put("/:paymentId/method", authenticateToken, paymentController.updatePaymentMethod);
router.post("/:paymentId/process", authenticateToken, paymentController.processPayment);

module.exports = router;
