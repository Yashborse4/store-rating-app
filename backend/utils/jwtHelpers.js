const { 
  generateToken,
  verifyToken,
  generateTokenPair,
  decodeToken,
  isTokenExpired,
  getTokenExpiry
} = require('./jwt');

/**
 * JWT Testing and Validation Helpers
 */

/**
 * Generate a test token with custom expiry
 * @param {Object} payload - Token payload
 * @param {String} expiresIn - Custom expiry time
 * @returns {String} JWT token
 */
const generateTestToken = (payload, expiresIn = '1h') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'user-management-system',
    audience: 'user-management-client'
  });
};

/**
 * Generate an expired token for testing
 * @param {Object} payload - Token payload
 * @returns {String} Expired JWT token
 */
const generateExpiredToken = (payload) => {
  return generateTestToken(payload, '-1s');
};

/**
 * Validate token structure
 * @param {String} token - Token to validate
 * @returns {Object} Validation result
 */
const validateTokenStructure = (token) => {
  const errors = [];
  const warnings = [];
  
  if (!token || typeof token !== 'string') {
    errors.push('Token must be a non-empty string');
    return { isValid: false, errors, warnings };
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    errors.push('Invalid JWT structure. Expected 3 parts separated by dots');
    return { isValid: false, errors, warnings };
  }
  
  // Check if each part is base64 encoded
  const base64Regex = /^[A-Za-z0-9_-]+$/;
  parts.forEach((part, index) => {
    if (!base64Regex.test(part)) {
      errors.push(`Part ${index + 1} contains invalid characters for base64url encoding`);
    }
  });
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      errors.push('Unable to decode token');
    } else {
      // Check for required claims
      if (!decoded.userId) warnings.push('Token missing userId claim');
      if (!decoded.email) warnings.push('Token missing email claim');
      if (!decoded.role) warnings.push('Token missing role claim');
      if (!decoded.exp) errors.push('Token missing expiration claim');
      if (!decoded.iat) warnings.push('Token missing issued-at claim');
      if (!decoded.iss) warnings.push('Token missing issuer claim');
      if (!decoded.aud) warnings.push('Token missing audience claim');
    }
  } catch (error) {
    errors.push(`Failed to decode token: ${error.message}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Check token permissions for a specific action
 * @param {String} token - JWT token
 * @param {String} requiredRole - Required role for the action
 * @returns {Boolean} Whether token has permission
 */
const checkTokenPermission = (token, requiredRole) => {
  try {
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.role) {
      return false;
    }
    
    // Admin has all permissions
    if (decoded.role === 'system_admin') {
      return true;
    }
    
    // Check specific role match
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(decoded.role);
    }
    
    return decoded.role === requiredRole;
  } catch (error) {
    return false;
  }
};

/**
 * Extract user information from token
 * @param {String} token - JWT token
 * @returns {Object|null} User information or null
 */
const extractUserFromToken = (token) => {
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) return null;
    
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
};

/**
 * Calculate token remaining lifetime
 * @param {String} token - JWT token
 * @returns {Number|null} Remaining lifetime in seconds or null
 */
const getTokenRemainingTime = (token) => {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return null;
    
    const now = new Date();
    const remaining = Math.floor((expiry - now) / 1000);
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token will expire soon
 * @param {String} token - JWT token
 * @param {Number} threshold - Threshold in seconds (default: 5 minutes)
 * @returns {Boolean} Whether token will expire soon
 */
const isTokenExpiringSoon = (token, threshold = 300) => {
  const remaining = getTokenRemainingTime(token);
  return remaining !== null && remaining <= threshold;
};

/**
 * Generate mock user for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user object
 */
const generateMockUser = (overrides = {}) => {
  return {
    userId: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'normal_user',
    ...overrides
  };
};

/**
 * Generate authorization header
 * @param {String} token - JWT token
 * @returns {String} Authorization header value
 */
const generateAuthHeader = (token) => {
  return `Bearer ${token}`;
};

/**
 * Parse authorization header
 * @param {String} header - Authorization header
 * @returns {Object} Parsed header info
 */
const parseAuthHeader = (header) => {
  if (!header || typeof header !== 'string') {
    return { type: null, token: null, isValid: false };
  }
  
  const parts = header.split(' ');
  
  if (parts.length !== 2) {
    return { type: null, token: null, isValid: false };
  }
  
  return {
    type: parts[0],
    token: parts[1],
    isValid: parts[0] === 'Bearer' && !!parts[1]
  };
};

/**
 * Validate refresh token
 * @param {String} token - Refresh token
 * @returns {Object} Validation result
 */
const validateRefreshToken = (token) => {
  try {
    const decoded = decodeToken(token);
    
    if (!decoded) {
      return { isValid: false, error: 'Unable to decode token' };
    }
    
    if (decoded.type !== 'refresh') {
      return { isValid: false, error: 'Not a refresh token' };
    }
    
    if (isTokenExpired(token)) {
      return { isValid: false, error: 'Token expired' };
    }
    
    return { isValid: true, decoded };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

/**
 * Compare two tokens
 * @param {String} token1 - First token
 * @param {String} token2 - Second token
 * @returns {Object} Comparison result
 */
const compareTokens = (token1, token2) => {
  const decoded1 = decodeToken(token1);
  const decoded2 = decodeToken(token2);
  
  if (!decoded1 || !decoded2) {
    return { 
      areEqual: false, 
      error: 'Unable to decode one or both tokens' 
    };
  }
  
  return {
    areEqual: token1 === token2,
    sameUser: decoded1.userId === decoded2.userId,
    sameRole: decoded1.role === decoded2.role,
    comparison: {
      userId: { token1: decoded1.userId, token2: decoded2.userId },
      role: { token1: decoded1.role, token2: decoded2.role },
      expiry: { 
        token1: new Date(decoded1.exp * 1000), 
        token2: new Date(decoded2.exp * 1000) 
      }
    }
  };
};

/**
 * Create token test suite
 * @returns {Object} Test suite functions
 */
const createTokenTestSuite = () => {
  return {
    // Test token generation
    testTokenGeneration: () => {
      const user = generateMockUser();
      const tokens = generateTokenPair(user);
      
      return {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        accessTokenValid: validateTokenStructure(tokens.accessToken).isValid,
        refreshTokenValid: validateTokenStructure(tokens.refreshToken).isValid
      };
    },
    
    // Test token verification
    testTokenVerification: (token) => {
      try {
        const decoded = verifyToken(token);
        return { success: true, decoded };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    
    // Test token expiry
    testTokenExpiry: () => {
      const user = generateMockUser();
      const expiredToken = generateExpiredToken(user);
      
      return {
        isExpired: isTokenExpired(expiredToken),
        remainingTime: getTokenRemainingTime(expiredToken)
      };
    },
    
    // Test role permissions
    testRolePermissions: (token, requiredRoles) => {
      const results = {};
      
      if (Array.isArray(requiredRoles)) {
        requiredRoles.forEach(role => {
          results[role] = checkTokenPermission(token, role);
        });
      } else {
        results[requiredRoles] = checkTokenPermission(token, requiredRoles);
      }
      
      return results;
    }
  };
};

module.exports = {
  generateTestToken,
  generateExpiredToken,
  validateTokenStructure,
  checkTokenPermission,
  extractUserFromToken,
  getTokenRemainingTime,
  isTokenExpiringSoon,
  generateMockUser,
  generateAuthHeader,
  parseAuthHeader,
  validateRefreshToken,
  compareTokens,
  createTokenTestSuite
};
