const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(asyncHandler(orderController.getOrders))
  .post(
    authorize('CUSTOMER', 'ADMIN'),
    requireFields(['Order_StoreID', 'Order_DeliveryAddress', 'items']),
    asyncHandler(orderController.createOrder)
  );

router.patch(
  '/:id/assign-shopper',
  authorize('STORE_OWNER', 'ADMIN'),
  asyncHandler(orderController.assignShopper)
);

router
  .route('/:id')
  .get(asyncHandler(orderController.getOrder))
  .put(authorize('STORE_OWNER', 'ADMIN'), asyncHandler(orderController.updateOrder))
  .delete(authorize('ADMIN'), asyncHandler(orderController.deleteOrder));

module.exports = router;
