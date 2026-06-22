'use strict';

const { Router }          = require('express');
const notifCtrl           = require('../controllers/notificationController');
const { authenticate }    = require('../middlewares/authMiddleware');

const router = Router();
router.use(authenticate);

router.get ('/',              notifCtrl.getNotifications);
router.patch('/read-all',     notifCtrl.markAllRead);
router.patch('/:id/read',     notifCtrl.markRead);

module.exports = router;
