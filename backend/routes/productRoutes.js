const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', asyncHandler(productController.getProducts));
router.get('/:id', asyncHandler(productController.getProduct));

router.post(
  '/',
  protect,
  authorize('STORE_OWNER', 'ADMIN'),
  requireFields(['Prod_StoreID', 'Prod_Name', 'Prod_Price', 'Prod_Stock']),
  asyncHandler(productController.createProduct)
);

router.put(
  '/:id',
  protect,
  authorize('STORE_OWNER', 'ADMIN'),
  asyncHandler(productController.updateProduct)
);

router.delete(
  '/:id',
  protect,
  authorize('STORE_OWNER', 'ADMIN'),
  asyncHandler(productController.deleteProduct)
);

module.exports = router;
