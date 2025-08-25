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
        const response = await getAllStores();
        
        // Handle different response structures
        let storeData = [];
        if (response) {
          if (Array.isArray(response)) {
            storeData = response;
          } else if (response.stores && Array.isArray(response.stores)) {
            storeData = response.stores;
          } else if (response.data && Array.isArray(response.data)) {
            storeData = response.data;
          }
        }
        
        // Ensure each store has required properties with defaults
        const processedStores = storeData.map(store => ({
          id: store?.id || Math.random().toString(36),
          name: store?.name || store?.store_name || 'Unknown Store',
          location: store?.location || store?.store_location || 'Unknown Location',
          description: store?.description || store?.store_description || '',
          rating: parseFloat(store?.rating || store?.average_rating || 0),
          totalRatings: parseInt(store?.totalRatings || store?.total_ratings || 0),
          category: store?.category || 'Uncategorized',
          image: store?.image || store?.store_image || null
        }));
        
        setStores(processedStores);
        setFilteredStores(processedStores);
      } catch (err) {
        console.error('Failed to load stores:', err);
        setError(err.message || 'Failed to load stores. Please try again later.');
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
    // Ensure stores is an array
    if (!Array.isArray(stores)) {
      setFilteredStores([]);
      return;
    }

    let filtered = [...stores];

    // Filter by search term with null checks
    if (searchTerm) {
      filtered = filtered.filter(store => {
        if (!store) return false;
        const name = (store.name || '').toLowerCase();
        const location = (store.location || '').toLowerCase();
        const description = (store.description || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || location.includes(term) || description.includes(term);
      });
    }

    // Filter by category with null checks
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store => 
        store && store.category === selectedCategory
      );
    }

    // Sort stores with null checks
    filtered = filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'reviews':
          return (b.totalRatings || 0) - (a.totalRatings || 0);
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
    // Ensure stores is an array before processing
    const storeList = Array.isArray(stores) ? stores : [];
    
    // Calculate total stores
    const totalStores = storeList.length;
    
    // Calculate average rating with null checks
    let averageRating = '0.0';
    if (storeList.length > 0) {
      const validStores = storeList.filter(store => 
        store && typeof store.rating === 'number' && !isNaN(store.rating)
      );
      if (validStores.length > 0) {
        const sum = validStores.reduce((acc, store) => acc + store.rating, 0);
        averageRating = (sum / validStores.length).toFixed(1);
      }
    }
    
    // Calculate total reviews with null checks
    const totalReviews = storeList.reduce((sum, store) => {
      if (store && typeof store.totalRatings === 'number' && !isNaN(store.totalRatings)) {
        return sum + store.totalRatings;
      }
      return sum;
    }, 0);
    
    return {
      totalStores,
      averageRating,
      totalReviews
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
