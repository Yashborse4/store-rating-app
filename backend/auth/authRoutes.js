const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { authenticateToken } = require('./authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   GET /api/auth/dashboard
 * @desc    Get role-specific dashboard URL
 * @access  Private
 */
router.get('/dashboard', authenticateToken, authController.getDashboard);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token using refresh token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/validate
 * @desc    Validate current session and return user data
 * @access  Private
 */
router.get('/validate', authenticateToken, authController.validateSession);

/**
 * @route   GET /api/auth/roles
 * @desc    Get available roles (for registration form)
 * @access  Public
 */
router.get('/roles', authController.getRoles);

module.exports = router;
