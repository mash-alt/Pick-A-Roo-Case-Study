const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const storeController = require('../controllers/storeController');

const router = express.Router();

router.get('/', asyncHandler(storeController.getStores));
router.get('/mine', protect, authorize('STORE_OWNER'), asyncHandler(storeController.getMyStores));
router.get('/:id', asyncHandler(storeController.getStore));

router.post(
  '/',
  protect,
  authorize('STORE_OWNER', 'ADMIN'),
  requireFields(['Store_Name', 'Store_City', 'Store_Loc', 'Store_ContactNum']),
  asyncHandler(storeController.createStore)
);

router.put(
  '/:id',
  protect,
  authorize('STORE_OWNER', 'ADMIN'),
  asyncHandler(storeController.updateStore)
);

router.delete(
  '/:id',
  protect,
  authorize('STORE_OWNER', 'ADMIN'),
  asyncHandler(storeController.deleteStore)
);

module.exports = router;
