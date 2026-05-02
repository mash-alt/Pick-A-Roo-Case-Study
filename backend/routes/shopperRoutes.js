const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const shopperController = require('../controllers/shopperController');

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router
  .route('/')
  .get(asyncHandler(shopperController.getShoppers))
  .post(
    requireFields(['Shopr_FName', 'Shopr_LName', 'Shopr_PhoneNum']),
    asyncHandler(shopperController.createShopper)
  );

router
  .route('/:id')
  .get(asyncHandler(shopperController.getShopper))
  .put(asyncHandler(shopperController.updateShopper))
  .delete(asyncHandler(shopperController.deleteShopper));

module.exports = router;
