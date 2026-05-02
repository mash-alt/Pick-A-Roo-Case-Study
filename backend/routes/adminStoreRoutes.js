const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const adminStoreController = require('../controllers/adminStoreController');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Store CRUD operations
router.get('/', asyncHandler(adminStoreController.getStores));
router.get('/:id', asyncHandler(adminStoreController.getStore));
router.get('/:id/stats', asyncHandler(adminStoreController.getStoreStats));

router.post(
  '/',
  requireFields(['Store_Name', 'Store_City', 'Store_Loc', 'Store_OwnerID']),
  asyncHandler(adminStoreController.createStore)
);

router.put(
  '/:id',
  asyncHandler(adminStoreController.updateStore)
);

router.delete(
  '/:id',
  asyncHandler(adminStoreController.deleteStore)
);

module.exports = router;