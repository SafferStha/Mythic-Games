"use strict";

const { Router } = require("express");
const authRoutes          = require("./authRoutes");
const userRoutes          = require("./userRoutes");
const cartRoutes          = require("./cartRoutes");
const checkoutRoutes      = require("./checkoutRoutes");
const orderRoutes         = require("./orderRoutes");
const paymentRoutes       = require("./paymentRoutes");
const invoiceRoutes       = require("./invoiceRoutes");
const receiptRoutes       = require("./receiptRoutes");
const adminRoutes         = require("./adminRoutes");
const wishlistRoutes      = require("./wishlistRoutes");
const libraryRoutes       = require("./libraryRoutes");
const reviewRoutes        = require("./reviewRoutes");
const notificationRoutes  = require("./notificationRoutes");
const refundRoutes        = require("./refundRoutes");

/**
 * Root API router.
 * Mount all feature routers here; app.js mounts this under /api.
 *
 * Pattern:  /api/<feature>/<action>
 */
const router = Router();

router.use("/auth",          authRoutes);
router.use("/users",         userRoutes);
router.use("/cart",          cartRoutes);
router.use("/checkout",      checkoutRoutes);
router.use("/orders",        orderRoutes);
router.use("/payment",       paymentRoutes);
router.use("/invoice",       invoiceRoutes);
router.use("/receipt",       receiptRoutes);
router.use("/admin",         adminRoutes);
router.use("/wishlist",      wishlistRoutes);
router.use("/library",       libraryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/refunds",       refundRoutes);

// Review routes have mixed public/protected paths — mount at /api directly
router.use("/", reviewRoutes);

module.exports = router;
