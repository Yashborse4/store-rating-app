const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'user-management-system',
    audience: 'user-management-client'
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'user-management-system',
      audience: 'user-management-client'
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Generate refresh token (longer expiry)
 * @param {Object} payload - User data to include in token
 * @returns {String} Refresh JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'user-management-system',
    audience: 'user-management-client'
  });
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null
 */
const extractToken = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Get role-specific redirect URL
 * @param {String} roleName - Name of the user role
 * @returns {String} Frontend URL for the role
 */
const getRoleRedirectUrl = (roleName) => {
  const urls = {
    'system_admin': process.env.FRONTEND_ADMIN_URL,
    'normal_user': process.env.FRONTEND_USER_URL,
    'store_owner': process.env.FRONTEND_STORE_URL
  };
  
  return urls[roleName] || process.env.FRONTEND_USER_URL;
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  extractToken,
  getRoleRedirectUrl
};
