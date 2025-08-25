const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin
} = require('../auth');

// All routes in this file are protected and require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', requireAdmin, userController.getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post('/', requireAdmin, userController.createUser);

/**
 * @route   GET /api/users/admin/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/admin/dashboard-stats', requireAdmin, userController.getDashboardStats);

/**
 * @route   GET /api/users/role/:roleName
 * @desc    Get users by role
 * @access  Private
 */
router.get('/role/:roleName', userController.getUsersByRole);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (Owner or Admin)
 */
router.get('/:userId', requireOwnershipOrAdmin, userController.getUserById);

/**
 * @route   PUT /api/users/:userId/password
 * @desc    Update user password
 * @access  Private (Owner or Admin)
 */
router.put('/:userId/password', requireOwnershipOrAdmin, userController.updatePassword);

/**
 * @route   PATCH /api/users/:userId/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.patch('/:userId/status', requireAdmin, userController.updateUserStatus);

module.exports = router;
