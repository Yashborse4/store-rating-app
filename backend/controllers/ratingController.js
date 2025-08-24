const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { validateRating } = require('../utils/validation');

/**
 * Submit or update a rating (Normal User only)
 */
const submitRating = async (req, res) => {
  try {
    // Ensure only normal users can submit ratings
    if (req.user.role !== 'normal_user') {
      return res.status(403).json({
        success: false,
        message: 'Only normal users can submit ratings.',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const userId = req.user.id;
    const { storeId, rating, review_comment } = req.body;

    // Validate rating
    const ratingValidation = validateRating(rating);
    if (!ratingValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating.',
        error: 'VALIDATION_ERROR',
        errors: ratingValidation.errors
      });
    }

    // Validate store ID
    if (!storeId || typeof storeId !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid store ID is required.',
        error: 'INVALID_STORE_ID'
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
        error: 'STORE_NOT_FOUND'
      });
    }

    // Submit/update rating
    const submittedRating = await Rating.submitRating(userId, storeId, ratingValidation.value, review_comment);
    
    // Update store rating statistics
    await Store.updateRatingStats(storeId);

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: {
        rating: submittedRating,
        store: {
          id: store.id,
          store_name: store.store_name
        }
      }
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get user's rating for a specific store
 */
const getUserRatingForStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.params;

    const rating = await Rating.findByUserAndStore(userId, parseInt(storeId));
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'No rating found for this store.',
        error: 'RATING_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rating retrieved successfully.',
      data: {
        rating
      }
    });

  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get all ratings by current user
 */
const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const ratings = await Rating.findByUserId(userId);

    res.status(200).json({
      success: true,
      message: 'User ratings retrieved successfully.',
      data: {
        ratings,
        total: ratings.length
      }
    });

  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Delete a rating (Normal User only)
 */
const deleteRating = async (req, res) => {
  try {
    // Ensure only normal users can delete ratings
    if (req.user.role !== 'normal_user') {
      return res.status(403).json({
        success: false,
        message: 'Only normal users can delete ratings.',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const userId = req.user.id;
    const { storeId } = req.params;

    const deletedRating = await Rating.deleteRating(userId, parseInt(storeId));
    
    if (!deletedRating) {
      return res.status(404).json({
        success: false,
        message: 'No rating found to delete.',
        error: 'RATING_NOT_FOUND'
      });
    }

    // Update store rating statistics
    await Store.updateRatingStats(parseInt(storeId));

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully.',
      data: {
        deleted_rating: deletedRating
      }
    });

  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get ratings for a store (Admin or Store Owner only)
 */
const getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    const currentUser = req.user;
    
    // Check permissions
    if (currentUser.role === 'store_owner') {
      // Store owners can only view ratings for their own store
      const store = await Store.findById(parseInt(storeId));
      if (!store || store.owner_user_id !== currentUser.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view ratings for your own store.',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }
    }

    const ratings = await Rating.findByStoreId(parseInt(storeId));
    const ratingStats = await Rating.getStoreRatingStats(parseInt(storeId));

    res.status(200).json({
      success: true,
      message: 'Store ratings retrieved successfully.',
      data: {
        ratings,
        statistics: ratingStats,
        total: ratings.length
      }
    });

  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get rating statistics for a store (Public access)
 */
const getStoreRatingStats = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Check if store exists
    const store = await Store.findById(parseInt(storeId));
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
        error: 'STORE_NOT_FOUND'
      });
    }

    const ratingStats = await Rating.getStoreRatingStats(parseInt(storeId));

    res.status(200).json({
      success: true,
      message: 'Store rating statistics retrieved successfully.',
      data: {
        store: {
          id: store.id,
          store_name: store.store_name,
          store_description: store.store_description
        },
        statistics: ratingStats
      }
    });

  } catch (error) {
    console.error('Get store rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get overall rating statistics (Admin only)
 */
const getOverallRatingStats = async (req, res) => {
  try {
    const overallStats = await Rating.getOverallStats();
    const recentRatings = await Rating.getRecentRatings(20);

    res.status(200).json({
      success: true,
      message: 'Overall rating statistics retrieved successfully.',
      data: {
        statistics: overallStats,
        recent_ratings: recentRatings
      }
    });

  } catch (error) {
    console.error('Get overall rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  submitRating,
  getUserRatingForStore,
  getMyRatings,
  deleteRating,
  getStoreRatings,
  getStoreRatingStats,
  getOverallRatingStats
};
