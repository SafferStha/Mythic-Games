'use strict';

const { Router }       = require('express');
const userController   = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize }    = require('../middlewares/roleGuard');
const { ROLES }        = require('../constants/roles');

const router = Router();

// All user-management routes are admin-only.
// The middleware chain: verify JWT → verify role → execute handler.
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/',     userController.listUsers);
router.get('/:id',  userController.getUser);
router.post('/',    userController.createUser);
router.put('/:id',  userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
