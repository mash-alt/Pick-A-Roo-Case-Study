const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const adminUserController = require('../controllers/adminUserController');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// User CRUD operations
router.get('/', asyncHandler(adminUserController.getUsers));
router.get('/:id', asyncHandler(adminUserController.getUser));

router.post(
  '/',
  requireFields(['User_Email', 'User_Password', 'User_FName', 'User_LName']),
  asyncHandler(adminUserController.createUser)
);

router.put(
  '/:id',
  asyncHandler(adminUserController.updateUser)
);

router.delete(
  '/:id',
  asyncHandler(adminUserController.deleteUser)
);

module.exports = router;