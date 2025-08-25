import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { validateName, validateEmail, validatePassword, validateAddress, hasFormErrors } from '../utils/validation';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { 
    getDashboardStats, 
    getAllUsers, 
    getAllStores, 
    addUser, 
    getUserById,
    logout 
  } = useAuth();
  
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add user form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal_user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Filter states
  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  const [storeFilters, setStoreFilters] = useState({
    name: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData, storesData] = await Promise.all([
          getDashboardStats(),
          getAllUsers(),
          getAllStores()
        ]);
        setStats(statsData);
        setUsers(usersData);
        setStores(storesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values to prevent filter errors
        setStats({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
        setUsers([]);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [getDashboardStats, getAllUsers, getAllStores]);

  // Real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'address':
        return validateAddress(value);
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
    setSubmitMessage('');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      address: validateField('address', formData.address)
    };
    
    // Remove null errors
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    
    setFormErrors(errors);
    
    if (hasFormErrors(errors)) {
      setSubmitMessage('Please fix the errors above');
      return;
    }
    
    setLoading(true);
    try {
      await addUser(formData);
      setSubmitMessage('User added successfully');
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'normal_user'
      });
      setFormErrors({});
      // Refresh user list
      const refreshedUsers = await getAllUsers();
      setUsers(refreshedUsers);
      // Hide form after success
      setTimeout(() => {
        setShowAddUserForm(false);
        setSubmitMessage('');
      }, 2000);
    } catch (error) {
      setSubmitMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const user = await getUserById(userId);
      setSelectedUser(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleFilterChange = (filterType, field, value) => {
    if (filterType === 'user') {
      setUserFilters(prev => ({ ...prev, [field]: value }));
    } else {
      setStoreFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  // Filter users - ensure users is an array before filtering
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    return (
      user.name.toLowerCase().includes(userFilters.name.toLowerCase()) &&
      user.email.toLowerCase().includes(userFilters.email.toLowerCase()) &&
      user.address.toLowerCase().includes(userFilters.address.toLowerCase()) &&
      (userFilters.role === '' || user.role === userFilters.role)
    );
  }) : [];

  // Filter stores - ensure stores is an array before filtering
  const filteredStores = Array.isArray(stores) ? stores.filter(store => {
    return (
      store.name.toLowerCase().includes(storeFilters.name.toLowerCase()) &&
      store.email.toLowerCase().includes(storeFilters.email.toLowerCase()) &&
      store.address.toLowerCase().includes(storeFilters.address.toLowerCase())
    );
  }) : [];

  // Show loading screen while initial data is being fetched
  if (loading && users.length === 0 && stores.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2>Loading Dashboard...</h2>
            <p>Please wait while we fetch the data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>System Administrator Dashboard</h1>
            <p>Manage users, stores, and view platform statistics</p>
          </div>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>

        {/* Dashboard Statistics */}
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value">{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-value">{stats.totalRatings}</div>
            <div className="stat-label">Total Ratings</div>
          </div>
        </div>

        {/* Add User Section */}
        <div className="section glass-card">
          <div className="section-header">
            <h2>User Management</h2>
            <button 
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="btn btn-primary"
            >
              {showAddUserForm ? 'Cancel' : 'Add New User'}
            </button>
          </div>

          {showAddUserForm && (
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-grid">
                <FormInput
                  id="name"
                  name="name"
                  type="text"
                  label="Name"
                  placeholder="Enter user's full name (20-60 characters)"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={formErrors.name}
                  required
                  maxLength={60}
                />
                
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={formErrors.email}
                  required
                />
              </div>

              <div className="form-grid">
                <FormInput
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Password (8-16 chars, uppercase + special char)"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                  required
                  maxLength={16}
                />

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="normal_user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="system_admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <FormInput
                id="address"
                name="address"
                type="textarea"
                label="Address"
                placeholder="Enter complete address (max 400 characters)"
                value={formData.address}
                onChange={handleInputChange}
                error={formErrors.address}
                required
                maxLength={400}
                rows={3}
              />

              {submitMessage && (
                <div className={`message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding User...' : 'Add User'}
              </button>
            </form>
          )}
        </div>

        {/* User Listing */}
        <div className="section glass-card">
          <div className="section-header">
            <h2>User Listing</h2>
          </div>

          {/* User Filters */}
          <div className="filters-grid">
            <FormInput
              id="userFilterName"
              name="name"
              type="text"
              placeholder="Filter by name"
              value={userFilters.name}
              onChange={(e) => handleFilterChange('user', 'name', e.target.value)}
            />
            <FormInput
              id="userFilterEmail"
              name="email"
              type="text"
              placeholder="Filter by email"
              value={userFilters.email}
              onChange={(e) => handleFilterChange('user', 'email', e.target.value)}
            />
            <FormInput
              id="userFilterAddress"
              name="address"
              type="text"
              placeholder="Filter by address"
              value={userFilters.address}
              onChange={(e) => handleFilterChange('user', 'address', e.target.value)}
            />
            <select
              value={userFilters.role}
              onChange={(e) => handleFilterChange('user', 'role', e.target.value)}
              className="form-control"
            >
              <option value="">All Roles</option>
              <option value="normal_user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="system_admin">System Administrator</option>
            </select>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewUser(user.id)}
                        className="btn btn-small btn-secondary"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store Listing */}
        <div className="section glass-card">
          <div className="section-header">
            <h2>Store Listing</h2>
          </div>

          {/* Store Filters */}
          <div className="filters-grid">
            <FormInput
              id="storeFilterName"
              name="name"
              type="text"
              placeholder="Filter by store name"
              value={storeFilters.name}
              onChange={(e) => handleFilterChange('store', 'name', e.target.value)}
            />
            <FormInput
              id="storeFilterEmail"
              name="email"
              type="text"
              placeholder="Filter by email"
              value={storeFilters.email}
              onChange={(e) => handleFilterChange('store', 'email', e.target.value)}
            />
            <FormInput
              id="storeFilterAddress"
              name="address"
              type="text"
              placeholder="Filter by address"
              value={storeFilters.address}
              onChange={(e) => handleFilterChange('store', 'address', e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>
                      <span className="rating-display">
                        {store.rating.toFixed(1)} ⭐
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal glass-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>User Details</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="btn btn-secondary btn-small"
                >
                  Close
                </button>
              </div>
              <div className="modal-body">
                <div className="user-details">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedUser.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Address:</label>
                    <span>{selectedUser.address}</span>
                  </div>
                  <div className="detail-item">
                    <label>Role:</label>
                    <span className={`role-badge ${selectedUser.role}`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedUser.role === 'store_owner' && selectedUser.storeRating && (
                    <div className="detail-item">
                      <label>Store Rating:</label>
                      <span className="rating-display">
                        {selectedUser.storeRating.toFixed(1)} ⭐
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
