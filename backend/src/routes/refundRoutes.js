'use strict';

const { Router }       = require('express');
const refundCtrl       = require('../controllers/refundController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = Router();
router.use(authenticate);

router.post('/',    refundCtrl.requestRefund);
router.get ('/',    refundCtrl.getMyRefunds);

module.exports = router;
