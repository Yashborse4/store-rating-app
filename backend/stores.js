const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireStoreOwnerOrAdmin,
  requireNormalUser
} = require('../middleware/auth');

/**
 * @route   POST /api/stores
 * @desc    Create a new store
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, requireAdmin, storeController.createStore);

/**
 * @route   GET /api/stores
 * @desc    Get all stores (Admin view)
 * @access  Private (Admin or Store Owner)
 */
router.get('/', authenticateToken, requireStoreOwnerOrAdmin, storeController.getAllStores);

/**
 * @route   GET /api/stores/user-ratings
 * @desc    Get stores with user ratings (for normal users)
 * @access  Private (Normal User)
 */
router.get('/user-ratings', authenticateToken, requireNormalUser, storeController.getStoresWithUserRating);

/**
 * @route   GET /api/stores/:storeId
 * @desc    Get store by ID
 * @access  Private
 */
router.get('/:storeId', authenticateToken, storeController.getStoreById);

/**
 * @route   PUT /api/stores/:storeId
 * @desc    Update store information
 * @access  Private (Admin only)
 */
router.put('/:storeId', authenticateToken, requireAdmin, storeController.updateStore);

module.exports = router;
