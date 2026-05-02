const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const orderItemController = require('../controllers/orderItemController');

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router
  .route('/')
  .get(asyncHandler(orderItemController.getOrderItems))
  .post(
    requireFields(['OItem_OrderID', 'OItem_ProdID', 'OItem_Quantity']),
    asyncHandler(orderItemController.createOrderItem)
  );

router
  .route('/:id')
  .get(asyncHandler(orderItemController.getOrderItem))
  .put(asyncHandler(orderItemController.updateOrderItem))
  .delete(asyncHandler(orderItemController.deleteOrderItem));

module.exports = router;
