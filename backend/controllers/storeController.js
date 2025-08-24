const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { validateStoreData } = require('../utils/validation');

/**
 * Create a new store (Admin only)
 */
const createStore = async (req, res) => {
  try {
    const storeData = req.body;
    const { store_name, store_id, owner_user_id, store_description } = req.body;

    // Basic validation
    if (!store_name || !store_id || !owner_user_id) {
      return res.status(400).json({
        success: false,
        message: 'Store name, store ID, and owner user ID are required.',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate owner_user_id
    if (typeof owner_user_id !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid owner_user_id is required.',
        error: 'INVALID_OWNER_USER_ID'
      });
    }

    // Check if store_id already exists
    const existingStore = await Store.findByStoreId(store_id);
    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: 'A store with this store ID already exists.',
        error: 'STORE_ID_EXISTS'
      });
    }

    // Create store
    const newStore = await Store.create({
      store_name,
      store_id,
      owner_user_id,
      store_description
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: {
        store: newStore
      }
    });

  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get all stores with optional search filters
 */
const getAllStores = async (req, res) => {
  try {
    const { store_name, store_id, store_description } = req.query;
    const filters = {};

    if (store_name) filters.store_name = store_name;
    if (store_id) filters.store_id = store_id;
    if (store_description) filters.store_description = store_description;

    const stores = await Store.findAll(filters);

    res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully.',
      data: {
        stores,
        total: stores.length,
        filters: filters
      }
    });

  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get stores with user ratings (for normal users)
 */
const getStoresWithUserRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { store_name, store_description } = req.query;
    const filters = {};

    if (store_name) filters.store_name = store_name;
    if (store_description) filters.store_description = store_description;

    const stores = await Store.findAllWithUserRating(userId, filters);

    res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully.',
      data: {
        stores: stores.map(store => ({
          id: store.id,
          store_name: store.store_name,
          store_id: store.store_id,
          store_description: store.store_description,
          average_rating: parseFloat(store.average_rating || 0),
          user_rating: store.user_rating || null,
          owner_name: store.owner_name || ''
        })),
        total: stores.length,
        filters: filters
      }
    });

  } catch (error) {
    console.error('Get stores with user rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get store by ID
 */
const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(parseInt(storeId));
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
        error: 'STORE_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store retrieved successfully.',
      data: {
        store
      }
    });

  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Update store information (Admin only)
 */
const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const storeData = req.body;

    // Validate store data
    const validation = validateStoreData(storeData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        error: 'VALIDATION_ERROR',
        errors: validation.errors
      });
    }

    const updatedStore = await Store.update(parseInt(storeId), validation.data);
    
    if (!updatedStore) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
        error: 'STORE_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store updated successfully.',
      data: {
        store: updatedStore
      }
    });

  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Update store status (Admin only)
 */
const updateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean value.',
        error: 'INVALID_STATUS'
      });
    }

    const updatedStore = await Store.updateStatus(parseInt(storeId), is_active);
    
    if (!updatedStore) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
        error: 'STORE_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: `Store ${is_active ? 'activated' : 'deactivated'} successfully.`,
      data: {
        store: updatedStore
      }
    });

  } catch (error) {
    console.error('Update store status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get store owner's store (for store owner dashboard)
 */
const getMyStore = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const store = await Store.findByOwnerUserId(ownerId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner.',
        error: 'STORE_NOT_FOUND'
      });
    }

    // Get store ratings
    const ratings = await Rating.findByStoreId(store.id);
    const ratingStats = await Rating.getStoreRatingStats(store.id);

    res.status(200).json({
      success: true,
      message: 'Store retrieved successfully.',
      data: {
        store: {
          ...store,
          ratings_summary: ratingStats,
          recent_ratings: ratings.slice(0, 10) // Last 10 ratings
        }
      }
    });

  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get users who rated the store (for store owner)
 */
const getStoreRatings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { storeId } = req.params;
    
    // Verify store ownership
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.owner_user_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view ratings for your own store.',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    const ratings = await Rating.findByStoreId(parseInt(storeId));
    const ratingStats = await Rating.getStoreRatingStats(parseInt(storeId));

    res.status(200).json({
      success: true,
      message: 'Store ratings retrieved successfully.',
      data: {
        store: {
          id: store.id,
          store_name: store.store_name,
          average_rating: parseFloat(store.average_rating || 0)
        },
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

module.exports = {
  createStore,
  getAllStores,
  getStoresWithUserRating,
  getStoreById,
  updateStore,
  updateStoreStatus,
  getMyStore,
  getStoreRatings
};
