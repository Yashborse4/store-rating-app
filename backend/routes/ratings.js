const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { 
  authenticateToken, 
  requireNormalUser,
  requireStoreOwnerOrAdmin
} = require('../auth');

/**
 * @route   POST /api/ratings
 * @desc    Submit or update a rating
 * @access  Private (Normal User only)
 */
router.post('/', authenticateToken, requireNormalUser, ratingController.submitRating);

/**
 * @route   GET /api/ratings/store/:storeId
 * @desc    Get user's rating for a specific store
 * @access  Private (Normal User only)
 */
router.get('/store/:storeId', authenticateToken, requireNormalUser, ratingController.getUserRatingForStore);

/**
 * @route   GET /api/ratings/my
 * @desc    Get all ratings by current user
 * @access  Private (Normal User only)
 */
router.get('/my', authenticateToken, requireNormalUser, ratingController.getMyRatings);

/**
 * @route   DELETE /api/ratings/store/:storeId
 * @desc    Delete a rating
 * @access  Private (Normal User only)
 */
router.delete('/store/:storeId', authenticateToken, requireNormalUser, ratingController.deleteRating);

/**
 * @route   GET /api/ratings/store/:storeId/all
 * @desc    Get all ratings for a store
 * @access  Private (Store Owner or Admin)
 */
router.get('/store/:storeId/all', authenticateToken, requireStoreOwnerOrAdmin, ratingController.getStoreRatings);

module.exports = router;
