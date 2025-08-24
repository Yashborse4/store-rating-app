const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { validateUserRegistration, validatePassword } = require('../utils/validation');

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        users,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully.',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Update user status (Admin only)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean value.',
        error: 'INVALID_STATUS'
      });
    }

    const user = await User.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === parseInt(userId) && !is_active) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.',
        error: 'CANNOT_DEACTIVATE_SELF'
      });
    }

    const updatedUser = await User.updateStatus(parseInt(userId), is_active);
    
    res.status(200).json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully.`,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get users by role (Admin and Store Owner can see their role users)
 */
const getUsersByRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    // Validate role
    const validRoles = ['system_admin', 'normal_user', 'store_owner'];
    if (!validRoles.includes(roleName)) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.',
        error: 'ROLE_NOT_FOUND'
      });
    }

    // Check permissions: Admin can see all, Store Owner can only see normal_user and store_owner
    if (req.user.role !== 'system_admin') {
      if (req.user.role === 'store_owner' && 
          !['normal_user', 'store_owner'].includes(roleName)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view this role.',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }
    }

    const users = await User.findAll({ role: roleName });
    
    res.status(200).json({
      success: true,
      message: `Users with role '${roleName}' retrieved successfully.`,
      data: {
        users,
        role: roleName,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Create new user (Admin only)
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Comprehensive validation using validation utility
    const validation = validateUserRegistration(userData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        error: 'VALIDATION_ERROR',
        errors: validation.errors
      });
    }

    const { name, email, password, role = 'normal_user', address } = validation.data;

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
        error: 'EMAIL_EXISTS'
      });
    }

    // Validate role
    const validRoles = ['system_admin', 'normal_user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
        error: 'INVALID_ROLE'
      });
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      address
    });

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during user creation.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get dashboard statistics (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get all users
    const allUsers = await User.findAll();
    const totalUsers = allUsers.length;
    
    // Get user counts by role
    const usersByRole = {
      system_admin: allUsers.filter(user => user.role === 'system_admin').length,
      normal_user: allUsers.filter(user => user.role === 'normal_user').length,
      store_owner: allUsers.filter(user => user.role === 'store_owner').length
    };
    
    // Get all stores
    const allStores = await Store.findAll();
    const totalStores = allStores.length;
    
    // Get all ratings
    const allRatings = await Rating.findAll();
    const totalRatings = allRatings.length;
    
    // Calculate average rating across all stores
    const averageRating = allRatings.length > 0 
      ? (allRatings.reduce((sum, rating) => sum + rating.rating, 0) / allRatings.length).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully.',
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          active: allUsers.filter(user => user.is_active).length,
          inactive: allUsers.filter(user => !user.is_active).length
        },
        stores: {
          total: totalStores,
          active: allStores.filter(store => store.is_active).length,
          withRatings: allStores.filter(store => store.total_ratings > 0).length
        },
        ratings: {
          total: totalRatings,
          averageRating: parseFloat(averageRating)
        },
        summary: {
          totalUsers,
          totalStores,
          totalRatings
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Update user password
 */
const updatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Ensure user can only update their own password unless they're admin
    if (req.user.role !== 'system_admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own password.',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    const user = await User.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        error: 'USER_NOT_FOUND'
      });
    }
    
    // If not admin, verify current password
    if (req.user.role !== 'system_admin') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required.',
          error: 'CURRENT_PASSWORD_REQUIRED'
        });
      }
      
      const isCurrentPasswordValid = await User.validatePassword(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect.',
          error: 'INVALID_CURRENT_PASSWORD'
        });
      }
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password validation failed.',
        error: 'VALIDATION_ERROR',
        errors: passwordValidation.errors
      });
    }
    
    // Update password
    await User.updatePassword(parseInt(userId), newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully.'
    });
    
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getUsersByRole,
  createUser,
  getDashboardStats,
  updatePassword
};
