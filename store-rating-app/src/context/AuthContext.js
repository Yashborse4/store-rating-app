import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, storeAPI, ratingAPI, dashboardAPI } from '../services/api';

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

  // Get all users (Admin only) with error handling
  const getAllUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      
      // Handle different response structures
      if (response?.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          return response.data.users;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      console.warn('Unexpected response structure from users API:', response);
      return [];
      
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array to prevent UI crashes
      return [];
    }
  };

  // Get user by ID with error handling
  const getUserById = async (id) => {
    try {
      const response = await userAPI.getUserById(id);
      
      if (response?.data) {
        if (response.data.user) {
          return response.data.user;
        } else if (response.data.data) {
          return response.data.data;
        }
        return response.data;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  };

  // Get all stores (role-based access) with enhanced error handling
  const getAllStores = async (filters = {}) => {
    try {
      let response;
      
      // Admin users get full store management access
      if (user?.role === 'system_admin') {
        response = await storeAPI.getAllStores(filters);
      } else {
        // Normal users and store owners get stores with user rating context
        response = await storeAPI.getStoresWithUserRating(filters);
      }
      
      // Handle different response structures
      if (response?.data) {
        // If data is wrapped in a data property
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.stores && Array.isArray(response.data.stores)) {
          return response.data.stores;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      // Return empty array if no valid data structure found
      console.warn('Unexpected response structure from stores API:', response);
      return [];
      
    } catch (error) {
      console.error('Error fetching stores:', error);
      
      // Return empty array instead of throwing to prevent app crashes
      // This allows the UI to show "No stores found" instead of breaking
      return [];
    }
  };

  // Get ratings for a store (Store Owner) with error handling
  const getStoreRatings = async (storeId) => {
    try {
      const response = await ratingAPI.getStoreRatings(storeId);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching store ratings:', error);
      // Return empty array to prevent UI crashes
      return [];
    }
  };

  // Get user's rating for a store with error handling
  const getUserRating = async (storeId) => {
    try {
      const response = await ratingAPI.getUserRatingForStore(storeId);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      // Return null to indicate no rating
      return null;
    }
  };

  // Submit or update rating with enhanced error handling
  const submitRating = async (storeId, rating) => {
    try {
      const response = await ratingAPI.submitRating(storeId, rating);
      return response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw new Error(error.message || 'Failed to submit rating. Please try again.');
    }
  };

  // Get dashboard stats with role-based data
  const getDashboardStats = async () => {
    try {
      // Use the new dashboard API endpoint
      const response = await dashboardAPI.getDashboardData();
      
      if (response && response.stats) {
        return response.stats;
      }
      
      // Fallback to basic stats if new endpoint fails
      console.warn('Dashboard stats API not available, using fallback');
      
      try {
        const stores = await getAllStores();
        return {
          overview: {
            totalStores: Array.isArray(stores) ? stores.length : 0,
            averageRating: 0,
            totalRatings: 0
          }
        };
      } catch (fallbackError) {
        console.error('Fallback stats failed:', fallbackError);
        return {
          overview: {
            totalStores: 0,
            averageRating: 0,
            totalRatings: 0
          }
        };
      }
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return default stats structure to prevent UI crashes
      return {
        overview: {
          totalStores: 0,
          averageRating: 0,
          totalRatings: 0
        }
      };
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
