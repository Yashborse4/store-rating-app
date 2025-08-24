const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken, generateRefreshToken, getRoleRedirectUrl } = require('../utils/jwt');
const { validateUserRegistration, validatePassword } = require('../utils/validation');

/**
 * User Registration
 */
const register = async (req, res) => {
  try {
    const userData = req.body;

    // Comprehensive validation using validation utility
    const validation = validateUserRegistration(userData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        error: 'VALIDATION_ERROR',
        errors: validation.errors
      });
    }

    const { username, email, password, role_name, first_name, last_name, address } = validation.data;

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
        error: 'EMAIL_EXISTS'
      });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken.',
        error: 'USERNAME_EXISTS'
      });
    }

    // Get role ID
    const role = await Role.findByName(role_name);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
        error: 'INVALID_ROLE'
      });
    }

    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
      role_id: role.id,
      first_name,
      last_name,
      address
    });

    // Generate tokens
    const tokenPayload = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role_name: role_name
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role_name: role_name,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          address: newUser.address
        },
        token,
        refreshToken,
        redirectUrl: getRoleRedirectUrl(role_name)
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
      username: user.username,
      email: user.email,
      role_name: user.role_name
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role_name: user.role_name,
          first_name: user.first_name,
          last_name: user.last_name
        },
        token,
        refreshToken,
        redirectUrl: getRoleRedirectUrl(user.role_name)
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
          username: user.username,
          email: user.email,
          role_name: user.role_name,
          first_name: user.first_name,
          last_name: user.last_name
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
 * Logout (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled on the client side
    // by removing the token from storage. We can log this action for audit purposes.
    
    res.status(200).json({
      success: true,
      message: 'Logout successful.',
      data: {
        message: 'Please remove the token from client storage.'
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
    const redirectUrl = getRoleRedirectUrl(user.role_name);

    res.status(200).json({
      success: true,
      message: 'Dashboard URL retrieved successfully.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role_name: user.role_name,
          first_name: user.first_name,
          last_name: user.last_name
        },
        redirectUrl,
        dashboardType: user.role_name
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
 * Get available roles (for registration form)
 */
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully.',
      data: {
        roles: roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description
        }))
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
  getRoles
};
