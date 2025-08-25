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

// Role-based route mappings
const getRoleBasedRoute = (role) => {
  const roleRoutes = {
    'system_admin': '/admin',
    'normal_user': '/dashboard', 
    'store_owner': '/store-dashboard'
  };
  return roleRoutes[role] || '/dashboard';
};

// Check if current path requires authentication
const isAuthRequiredPath = (pathname) => {
  const publicPaths = ['/', '/login', '/register', '/signup', '/universal-login'];
  return !publicPaths.includes(pathname);
};

// Check if user should be redirected away from auth pages when already logged in
const isAuthPage = (pathname) => {
  const authPages = ['/login', '/register', '/signup', '/universal-login'];
  return authPages.includes(pathname);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        try {
          // Validate existing token
          const response = await authAPI.validateSession();
          
          if (response.success && response.data.user) {
            const userData = {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              role: response.data.user.role,
              address: response.data.user.address
            };
            setUser(userData);
            
            // Auto-redirect if on auth page and user is authenticated
            const currentPath = window.location.pathname;
            if (isAuthPage(currentPath)) {
              const redirectTo = getRoleBasedRoute(userData.role);
              window.history.replaceState(null, '', redirectTo);
            }
          } else {
            // Invalid session, clear storage
            clearAuthData();
          }
        } catch (error) {
          console.error('Session validation failed:', error.message);
          
          // Try to refresh token if available
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await authAPI.refreshToken(refreshToken);
              if (refreshResponse.success && refreshResponse.data.user) {
                const userData = {
                  id: refreshResponse.data.user.id,
                  email: refreshResponse.data.user.email,
                  name: refreshResponse.data.user.name,
                  role: refreshResponse.data.user.role,
                  address: refreshResponse.data.user.address
                };
                setUser(userData);
                
                // Auto-redirect if on auth page
                const currentPath = window.location.pathname;
                if (isAuthPage(currentPath)) {
                  const redirectTo = getRoleBasedRoute(userData.role);
                  window.history.replaceState(null, '', redirectTo);
                }
              } else {
                clearAuthData();
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError.message);
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      } else {
        // No token found, redirect to login if on protected page
        const currentPath = window.location.pathname;
        if (isAuthRequiredPath(currentPath)) {
          window.history.replaceState(null, '', '/login');
        }
      }
      
      setLoading(false);
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, []);

  // Clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  // Login function with automatic redirection
  const login = async (email, password, redirectTo = null) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data.user) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          address: response.data.user.address
        };
        
        // Store refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        setUser(userData);
        
        // Determine redirect destination
        const destination = redirectTo || getRoleBasedRoute(userData.role);
        
        // Use timeout to ensure state is updated before navigation
        setTimeout(() => {
          window.location.href = destination;
        }, 100);
        
        return userData;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Registration function with automatic redirection
  const register = async (userData, redirectTo = null) => {
    try {
      setLoading(true);
      const registrationData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'normal_user',
        address: userData.address || ''
      };
      
      const response = await authAPI.register(registrationData);
      
      if (response.success && response.data.user) {
        const newUser = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          address: response.data.user.address
        };
        
        // Store refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        setUser(newUser);
        
        // Determine redirect destination
        const destination = redirectTo || getRoleBasedRoute(newUser.role);
        
        // Use timeout to ensure state is updated before navigation
        setTimeout(() => {
          window.location.href = destination;
        }, 100);
        
        return newUser;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
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

  // Get all stores (role-based access)
  const getAllStores = async (filters = {}) => {
    try {
      // Admin users get full store management access
      if (user?.role === 'system_admin') {
        const response = await storeAPI.getAllStores(filters);
        return response.data;
      } else {
        // Normal users and store owners get stores with user rating context
        const response = await storeAPI.getStoresWithUserRating(filters);
        return response.data;
      }
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

  // Logout function with redirection
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      window.location.href = '/login';
    }
  };

  // Get user's appropriate dashboard route
  const getDashboardRoute = () => {
    return user ? getRoleBasedRoute(user.role) : '/login';
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken');
  };

  const value = {
    // State
    user,
    loading,
    isInitialized,
    
    // Authentication methods
    login,
    register,
    logout,
    
    // Utility methods
    isAuthenticated,
    hasRole,
    getDashboardRoute,
    
    // User management
    addUser,
    getAllUsers,
    getUserById,
    
    // Store management
    getAllStores,
    getStoreRatings,
    getUserRating,
    submitRating,
    
    // Admin methods
    getDashboardStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
