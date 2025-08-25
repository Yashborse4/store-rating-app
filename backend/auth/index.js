/**
 * Auth Module - Consolidated Authentication System
 * 
 * This module contains all authentication-related functionality:
 * - Routes: Authentication endpoints
 * - Controller: Authentication business logic
 * - Middleware: Authentication and authorization middleware
 */

const authRoutes = require('./authRoutes');
const authController = require('./authController');
const authMiddleware = require('./authMiddleware');

module.exports = {
  routes: authRoutes,
  controller: authController,
  middleware: authMiddleware,
  
  // Direct exports for commonly used middleware
  authenticateToken: authMiddleware.authenticateToken,
  requireAdmin: authMiddleware.requireAdmin,
  requireRole: authMiddleware.requireRole,
  requireStoreOwnerOrAdmin: authMiddleware.requireStoreOwnerOrAdmin,
  requireNormalUser: authMiddleware.requireNormalUser,
  requireOwnershipOrAdmin: authMiddleware.requireOwnershipOrAdmin,
  optionalAuth: authMiddleware.optionalAuth
};
