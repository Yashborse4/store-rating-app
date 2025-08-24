const { verifyToken, extractToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {String|Array} allowedRoles - Role name(s) that are allowed
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Convert to array if single role provided
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
        error: 'INSUFFICIENT_PERMISSIONS',
        required_role: roles,
        user_role: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is system admin
 */
const requireAdmin = requireRole('system_admin');

/**
 * Middleware to check if user is store owner or admin
 */
const requireStoreOwnerOrAdmin = requireRole(['store_owner', 'system_admin']);

/**
 * Middleware to check if user is normal user
 */
const requireNormalUser = requireRole('normal_user');

/**
 * Middleware to check if user can access their own resource or is admin
 * Expects req.params.userId to be present
 */
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED'
    });
  }

  const targetUserId = parseInt(req.params.userId);
  const currentUserId = req.user.id;
  const isAdmin = req.user.role === 'system_admin';

  // Allow if user is admin or accessing their own resource
  if (isAdmin || currentUserId === targetUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You can only access your own resources.',
    error: 'INSUFFICIENT_PERMISSIONS'
  });
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that behave differently for authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireStoreOwnerOrAdmin,
  requireNormalUser,
  requireOwnershipOrAdmin,
  optionalAuth
};
