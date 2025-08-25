const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m'; // Shorter access token expiry
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set();

// Validate JWT configuration
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET.length < 32) {
  console.warn('Warning: JWT_SECRET should be at least 32 characters long for security');
}

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
 * Generate refresh token with enhanced security
 * @param {Object} payload - User data to include in token
 * @returns {Object} Refresh token with metadata
 */
const generateRefreshToken = (payload) => {
  // Add unique identifier for refresh token rotation
  const tokenId = crypto.randomUUID();
  const enhancedPayload = {
    ...payload,
    tokenId,
    type: 'refresh'
  };

  const token = jwt.sign(enhancedPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'user-management-system',
    audience: 'user-management-client'
  });

  return { token, tokenId };
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
 * Verify refresh token with enhanced security
 * @param {String} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'user-management-system',
      audience: 'user-management-client'
    });

    // Ensure it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Blacklist a token (for logout functionality)
 * @param {String} token - Token to blacklist
 * @param {String} type - Type of token ('access' or 'refresh')
 */
const blacklistToken = (token, type = 'access') => {
  try {
    const decoded = type === 'refresh' ? verifyRefreshToken(token) : verifyToken(token);
    const expiry = decoded.exp * 1000; // Convert to milliseconds
    
    // Store token with expiry time
    tokenBlacklist.add(token);
    
    // Auto-remove from blacklist after expiry (memory cleanup)
    setTimeout(() => {
      tokenBlacklist.delete(token);
    }, expiry - Date.now());
    
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

/**
 * Check if token is blacklisted
 * @param {String} token - Token to check
 * @returns {Boolean} Whether token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Generate token pair (access and refresh tokens)
 * @param {Object} payload - User data to include in tokens
 * @returns {Object} Access and refresh tokens
 */
const generateTokenPair = (payload) => {
  // Ensure payload doesn't contain sensitive data
  const cleanPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name
  };

  const accessToken = generateToken(cleanPayload);
  const refreshTokenData = generateRefreshToken(cleanPayload);

  return {
    accessToken,
    refreshToken: refreshTokenData.token,
    refreshTokenId: refreshTokenData.tokenId,
    expiresIn: JWT_EXPIRE
  };
};

/**
 * Decode token without verification (for debugging)
 * @param {String} token - Token to decode
 * @returns {Object|null} Decoded token or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiry time
 * @param {String} token - Token to check
 * @returns {Date|null} Expiry date or null
 */
const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {String} token - Token to check
 * @returns {Boolean} Whether token is expired
 */
const isTokenExpired = (token) => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return expiry < new Date();
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

/**
 * Clean expired tokens from blacklist (maintenance function)
 */
const cleanBlacklist = () => {
  const now = Date.now();
  for (const token of tokenBlacklist) {
    if (isTokenExpired(token)) {
      tokenBlacklist.delete(token);
    }
  }
};

// Run cleanup every hour
setInterval(cleanBlacklist, 3600000);

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractToken,
  getRoleRedirectUrl,
  blacklistToken,
  isTokenBlacklisted,
  generateTokenPair,
  decodeToken,
  getTokenExpiry,
  isTokenExpired,
  cleanBlacklist
};
