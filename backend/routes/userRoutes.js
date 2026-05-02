const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router
  .route('/')
  .get(asyncHandler(userController.getUsers))
  .post(
    requireFields(['User_FName', 'User_LName', 'User_Email', 'User_Password', 'User_Role']),
    asyncHandler(userController.createUser)
  );

router
  .route('/:id')
  .get(asyncHandler(userController.getUser))
  .put(asyncHandler(userController.updateUser))
  .delete(asyncHandler(userController.deleteUser));

module.exports = router;
