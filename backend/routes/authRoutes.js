const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  requireFields(['User_FName', 'User_LName', 'User_Email', 'User_Password']),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  requireFields(['User_Email', 'User_Password']),
  asyncHandler(authController.login)
);

router.get('/me', protect, asyncHandler(authController.me));

module.exports = router;
