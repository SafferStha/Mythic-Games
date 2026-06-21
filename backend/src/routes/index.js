'use strict';

const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

/**
 * Root API router.
 * Mount all feature routers here; app.js mounts this under /api.
 *
 * Pattern:  /api/<feature>/<action>
 */
const router = Router();

router.use('/auth',  authRoutes);
router.use('/users', userRoutes);

module.exports = router;
