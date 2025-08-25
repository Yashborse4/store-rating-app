import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, storeAPI, ratingAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuthStatus = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        try {
          // Validate token with backend
          const response = await authAPI.getProfile();
          if (response.success) {
          const userData = {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role,
            address: response.data.user.address
          };
            setUser(userData);
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          // Token validation failed, clear storage
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
          console.error('Auth validation error:', error.message);
        }
      }
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          address: response.data.user.address
        };
        setUser(userData);
        return userData;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      // Prepare data for backend API
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'normal_user', // Default to normal user
        address: userData.address
      };
      
      const response = await authAPI.register(registrationData);
      if (response.success) {
        const newUser = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          address: response.data.user.address
        };
        setUser(newUser);
        return newUser;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    }
  };

  // Add new user (Admin only)
  const addUser = async (userData) => {
    try {
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        address: userData.address
      };
      
      const response = await authAPI.register(registrationData);
      if (response.success) {
        return {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          address: response.data.user.address
        };
      }
      throw new Error(response.message || 'Failed to add user');
    } catch (error) {
      throw error;
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // This would typically be a separate API endpoint
      // For now, we'll use the profile update or create a dedicated endpoint
      throw new Error('Password update functionality needs to be implemented in the backend');
    } catch (error) {
      throw error;
    }
  };

  // Get all users (Admin only)
  const getAllUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get users');
    }
  };

  // Get user by ID
  const getUserById = async (id) => {
    try {
      const response = await userAPI.getUserById(id);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user');
    }
  };

  // Get all stores
  const getAllStores = async (filters = {}) => {
    try {
      const response = await storeAPI.getAllStores(filters);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get stores');
    }
  };

  // Get ratings for a store (Store Owner)
  const getStoreRatings = async (storeId) => {
    try {
      const response = await ratingAPI.getStoreRatings(storeId);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get store ratings');
    }
  };

  // Get user's rating for a store
  const getUserRating = async (storeId) => {
    try {
      const response = await ratingAPI.getUserRatingForStore(storeId);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user rating');
    }
  };

  // Submit or update rating
  const submitRating = async (storeId, rating) => {
    try {
      const response = await ratingAPI.submitRating(storeId, rating);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit rating');
    }
  };

  // Get dashboard stats (Admin only)
  const getDashboardStats = async () => {
    try {
      // This would need to be implemented as a backend endpoint
      const [usersResponse, storesResponse] = await Promise.all([
        userAPI.getAllUsers(),
        storeAPI.getAllStores()
      ]);
      
      return {
        totalUsers: usersResponse.data.length || 0,
        totalStores: storesResponse.data.length || 0,
        totalRatings: 0 // This would need a separate endpoint
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get dashboard stats');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  const value = {
    user,
    login,
    register,
    addUser,
    updatePassword,
    getAllUsers,
    getUserById,
    getAllStores,
    getStoreRatings,
    getUserRating,
    submitRating,
    getDashboardStats,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
