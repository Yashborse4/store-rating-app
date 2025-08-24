import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiSearch, 
  FiFilter, 
  FiStar, 
  FiTrendingUp, 
  FiMapPin,
  FiGrid,
  FiList,
  FiPlus
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import StoreCard from '../components/StoreCard';
import RatingModal from '../components/RatingModal';
import './Dashboard.css';

// Categories for filtering
const categories = ['all', 'Electronics', 'Food & Beverage', 'Clothing', 'Grocery', 'Books', 'Fitness'];

const Dashboard = () => {
  const { user, getAllStores } = useAuth();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        setError('');
        const storeData = await getAllStores();
        setStores(storeData || []);
        setFilteredStores(storeData || []);
      } catch (err) {
        console.error('Failed to load stores:', err);
        setError('Failed to load stores. Please try again later.');
        setStores([]);
        setFilteredStores([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = stores;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    // Sort stores
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.totalRatings - a.totalRatings;
        default:
          return 0;
      }
    });

    setFilteredStores(filtered);
  }, [stores, searchTerm, selectedCategory, sortBy]);

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating, review) => {
    console.log('Rating submitted:', { store: selectedStore, rating, review });
    setShowRatingModal(false);
    setSelectedStore(null);
    // In a real app, you would update the store's rating here
  };

  const getStats = () => {
    return {
      totalStores: stores.length,
      averageRating: stores.length > 0 
        ? (stores.reduce((sum, store) => sum + store.rating, 0) / stores.length).toFixed(1)
        : '0.0',
      totalReviews: stores.reduce((sum, store) => sum + store.totalRatings, 0)
    };
  };

  const stats = getStats();

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Welcome back, {user?.name}!
            </h1>
            <p className="dashboard-subtitle">
              Discover and rate amazing stores in your area
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <button className="btn btn-primary">
              <FiPlus />
              Add Store
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="dashboard-stats grid grid-3">
          <div className="stat-card glass-card">
            <div className="stat-icon">
              <FiGrid />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalStores}</div>
              <div className="stat-label">Total Stores</div>
            </div>
          </div>
          
          <div className="stat-card glass-card">
            <div className="stat-icon">
              <FiStar />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageRating}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
          
          <div className="stat-card glass-card">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalReviews}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="dashboard-controls glass-card">
          <div className="search-section">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <div className="filter-group">
              <FiFilter className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
            
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="dashboard-content">
          {loading ? (
            <div className="loading-state glass-card">
              <div className="loading"></div>
              <p>Loading stores...</p>
            </div>
          ) : error ? (
            <div className="error-state glass-card">
              <h3>Error</h3>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="empty-state glass-card">
              <FiMapPin className="empty-icon" />
              <h3>No stores found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className={`stores-grid ${viewMode} grid ${viewMode === 'grid' ? 'grid-3' : ''}`}>
              {filteredStores.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  showActions={true}
                  onRate={handleRateStore}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          store={selectedStore}
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
