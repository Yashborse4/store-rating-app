const User = require('../models/User');
const { 
  generateTokenPair, 
  getRoleRedirectUrl, 
  verifyRefreshToken,
  blacklistToken,
  extractToken
} = require('../utils/jwt');
const { validateSimpleUserRegistration, validatePassword } = require('../utils/validation');

/**
 * User Registration
 */
const register = async (req, res) => {
  try {
    const userData = req.body;

    // Simple validation for frontend compatibility
    const validation = validateSimpleUserRegistration(userData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        error: 'VALIDATION_ERROR',
        errors: validation.errors
      });
    }

    const { name, email, password, address, role } = validation.data;

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

    // Generate tokens
    const tokenPayload = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: role
    };

    const tokens = generateTokenPair(tokenPayload);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: role,
          address: newUser.address
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        redirectUrl: getRoleRedirectUrl(role)
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * User Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Validate password
    const isPasswordValid = await User.validatePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const tokens = generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        redirectUrl: getRoleRedirectUrl(user.role)
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user; // Set by authenticateToken middleware

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Logout with token blacklisting
 */
const logout = async (req, res) => {
  try {
    // Get tokens from request
    const accessToken = extractToken(req.headers.authorization);
    const { refreshToken } = req.body;
    
    // Blacklist both tokens
    if (accessToken) {
      blacklistToken(accessToken, 'access');
    }
    
    if (refreshToken) {
      blacklistToken(refreshToken, 'refresh');
    }
    
    res.status(200).json({
      success: true,
      message: 'Logout successful.',
      data: {
        message: 'Tokens have been invalidated. Please remove them from client storage.'
      }
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get role-specific dashboard/redirect URL
 */
const getDashboard = async (req, res) => {
  try {
    const user = req.user; // Set by authenticateToken middleware
    const redirectUrl = getRoleRedirectUrl(user.role);

    res.status(200).json({
      success: true,
      message: 'Dashboard URL retrieved successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          address: user.address
        },
        redirectUrl,
        dashboardType: user.role
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Refresh JWT token with rotation
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
        error: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    
    // Find user to ensure they still exist and are active
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token or user not found.',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Blacklist old refresh token (rotation)
    blacklistToken(token, 'refresh');

    // Generate new token pair
    const tokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const tokens = generateTokenPair(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Validate current session
 */
const validateSession = async (req, res) => {
  try {
    // User is already validated by authenticateToken middleware
    const user = req.user;
    
    res.status(200).json({
      success: true,
      message: 'Session is valid.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        },
        isAuthenticated: true
      }
    });

  } catch (error) {
    console.error('Validate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Get available roles (for registration form)
 */
const getRoles = async (req, res) => {
  try {
    const roles = [
      { name: 'system_admin', description: 'System Administrator' },
      { name: 'normal_user', description: 'Normal User' },
      { name: 'store_owner', description: 'Store Owner' }
    ];
    
    res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully.',
      data: {
        roles
      }
    });

  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  getDashboard,
  refreshToken,
  validateSession,
  getRoles
};
