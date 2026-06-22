'use strict';

const { Router }       = require('express');
const libraryCtrl      = require('../controllers/libraryController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();
router.use(authenticate);

router.get('/',                 libraryCtrl.getLibrary);
router.get('/owns/:gameId',     libraryCtrl.checkOwnership);

module.exports = router;
