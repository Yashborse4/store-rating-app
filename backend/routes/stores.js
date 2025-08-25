const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const {
  authenticateToken,
  requireAdmin,
  requireStoreOwnerOrAdmin,
  requireRole
} = require('../auth');

// All routes in this file are protected and require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/stores
 * @desc    Create a new store
 * @access  Private (Admin only)
 */
router.post('/', requireAdmin, storeController.createStore);

/**
 * @route   GET /api/stores
 * @desc    Get all stores (for admin view)
 * @access  Private (Admin only)
 */
router.get('/', requireAdmin, storeController.getAllStores);

/**
 * @route   GET /api/stores/list
 * @desc    Get stores with user's rating (for normal users)
 * @access  Private
 */
router.get('/list', storeController.getStoresWithUserRating);

/**
 * @route   GET /api/stores/my-store
 * @desc    Get the store owned by the current user
 * @access  Private (Store Owner only)
 */
router.get('/my-store', requireRole('store_owner'), storeController.getMyStore);

/**
 * @route   GET /api/stores/:storeId
 * @desc    Get a single store by ID
 * @access  Private
 */
router.get('/:storeId', storeController.getStoreById);

/**
 * @route   PUT /api/stores/:storeId
 * @desc    Update a store
 * @access  Private (Admin only)
 */
router.put('/:storeId', requireAdmin, storeController.updateStore);

/**
 * @route   PATCH /api/stores/:storeId/status
 * @desc    Update a store's status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.patch('/:storeId/status', requireAdmin, storeController.updateStoreStatus);

/**
 * @route   GET /api/stores/:storeId/ratings
 * @desc    Get all ratings for a specific store
 * @access  Private (Store Owner or Admin)
 */
router.get('/:storeId/ratings', requireStoreOwnerOrAdmin, storeController.getStoreRatings);

module.exports = router;
