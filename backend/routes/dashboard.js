const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../auth');

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics based on user role
 * @access  Private (All authenticated users)
 */
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
