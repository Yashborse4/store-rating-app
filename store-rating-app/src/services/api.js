import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return { success: true };
    } catch (error) {
      // Always clear local storage even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return { success: true };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Get dashboard URL based on role
  getDashboard: async () => {
    try {
      const response = await api.get('/api/auth/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get dashboard');
    }
  },

  // Get available roles
  getRoles: async () => {
    try {
      const response = await api.get('/api/auth/roles');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get roles');
    }
  }
};

// User API endpoints
export const userAPI = {
  // Get all users (Admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get users');
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/api/users/${userId}/status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  },

  // Get users by role
  getUsersByRole: async (roleName) => {
    try {
      const response = await api.get(`/api/users/role/${roleName}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get users by role');
    }
  }
};

// Store API endpoints (need to add these routes to backend)
export const storeAPI = {
  // Get all stores
  getAllStores: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get(`/api/stores?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get stores');
    }
  },

  // Get stores with user ratings (for normal users)
  getStoresWithUserRating: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get(`/api/stores/user-ratings?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get stores with ratings');
    }
  },

  // Get store by ID
  getStoreById: async (storeId) => {
    try {
      const response = await api.get(`/api/stores/${storeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get store');
    }
  },

  // Create new store (Admin only)
  createStore: async (storeData) => {
    try {
      const response = await api.post('/api/stores', storeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create store');
    }
  },

  // Update store (Admin only)
  updateStore: async (storeId, storeData) => {
    try {
      const response = await api.put(`/api/stores/${storeId}`, storeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update store');
    }
  }
};

// Rating API endpoints (need to add these routes to backend)
export const ratingAPI = {
  // Submit or update rating
  submitRating: async (storeId, rating) => {
    try {
      const response = await api.post('/api/ratings', { storeId, rating });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit rating');
    }
  },

  // Get user rating for a store
  getUserRatingForStore: async (storeId) => {
    try {
      const response = await api.get(`/api/ratings/store/${storeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get rating');
    }
  },

  // Get all ratings by current user
  getMyRatings: async () => {
    try {
      const response = await api.get('/api/ratings/my');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get my ratings');
    }
  },

  // Delete rating
  deleteRating: async (storeId) => {
    try {
      const response = await api.delete(`/api/ratings/store/${storeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete rating');
    }
  },

  // Get ratings for a store (Admin/Store Owner)
  getStoreRatings: async (storeId) => {
    try {
      const response = await api.get(`/api/ratings/store/${storeId}/all`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get store ratings');
    }
  }
};

// System API endpoints
export const systemAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('System health check failed');
    }
  }
};

export default api;
