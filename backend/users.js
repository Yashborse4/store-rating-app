const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireStoreOwnerOrAdmin,
  requireOwnershipOrAdmin 
} = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (Own resource or Admin)
 */
router.get('/:userId', authenticateToken, requireOwnershipOrAdmin, userController.getUserById);

/**
 * @route   PUT /api/users/:userId/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.put('/:userId/status', authenticateToken, requireAdmin, userController.updateUserStatus);

/**
 * @route   GET /api/users/role/:roleName
 * @desc    Get users by role
 * @access  Private (Admin or Store Owner for limited roles)
 */
router.get('/role/:roleName', authenticateToken, requireStoreOwnerOrAdmin, userController.getUsersByRole);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, requireAdmin, userController.createUser);

/**
 * @route   GET /api/users/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats/dashboard', authenticateToken, requireAdmin, userController.getDashboardStats);

/**
 * @route   PUT /api/users/:userId/password
 * @desc    Update user password
 * @access  Private (Own resource or Admin)
 */
router.put('/:userId/password', authenticateToken, requireOwnershipOrAdmin, userController.updatePassword);

module.exports = router;
