"use strict";

const { Router } = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const cartRoutes = require("./cartRoutes");

/**
 * Root API router.
 * Mount all feature routers here; app.js mounts this under /api.
 *
 * Pattern:  /api/<feature>/<action>
 */
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cart", cartRoutes);

module.exports = router;
