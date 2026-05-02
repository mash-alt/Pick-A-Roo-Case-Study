const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const deliveryController = require('../controllers/deliveryController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(asyncHandler(deliveryController.getDeliveries))
  .post(
    authorize('STORE_OWNER', 'ADMIN'),
    requireFields(['Dlvery_OrderID', 'Dlvery_RiderName', 'Dlvery_Distance', 'Dlvery_DeliveryFee']),
    asyncHandler(deliveryController.createDelivery)
  );

router
  .route('/:id')
  .get(asyncHandler(deliveryController.getDelivery))
  .put(authorize('STORE_OWNER', 'ADMIN'), asyncHandler(deliveryController.updateDelivery))
  .delete(authorize('STORE_OWNER', 'ADMIN'), asyncHandler(deliveryController.deleteDelivery));

module.exports = router;
