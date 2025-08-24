import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiMapPin, 
  FiStar, 
  FiClock, 
  FiPhone, 
  FiGlobe,
  FiArrowLeft,
  FiUser,
  FiCalendar
} from 'react-icons/fi';
import StarRating from '../components/StarRating';
import RatingModal from '../components/RatingModal';
import './StoreDetails.css';

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Mock store data
  const mockStore = {
    id: parseInt(id),
    name: "TechWorld Electronics",
    category: "Electronics",
    location: "Downtown Plaza, 123 Main St",
    phone: "+1 (555) 123-4567",
    website: "https://techworld.example.com",
    hours: "Mon-Sat: 9AM-8PM, Sun: 11AM-6PM",
    image: null,
    rating: 4.8,
    totalRatings: 342,
    description: "Latest gadgets and electronics with excellent customer service. We offer a wide range of smartphones, laptops, gaming equipment, and smart home devices from all major brands.",
    amenities: ["Free WiFi", "Parking Available", "Expert Support", "Warranty Service", "Online Ordering"]
  };

  const mockReviews = [
    {
      id: 1,
      user: "Alice Johnson",
      rating: 5,
      review: "Excellent service and great prices! The staff was very knowledgeable and helped me find exactly what I needed.",
      date: "2024-08-15",
      verified: true
    },
    {
      id: 2,
      user: "Mike Chen",
      rating: 4,
      review: "Good selection of products. Bought a laptop here and it works perfectly. Only minor complaint is the wait time during busy hours.",
      date: "2024-08-10",
      verified: true
    },
    {
      id: 3,
      user: "Sarah Williams",
      rating: 5,
      review: "Amazing customer service! They went above and beyond to help me with my phone repair. Highly recommended!",
      date: "2024-08-05",
      verified: true
    },
    {
      id: 4,
      user: "David Brown",
      rating: 4,
      review: "Great store with competitive prices. The staff is friendly and the location is convenient.",
      date: "2024-07-28",
      verified: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStore(mockStore);
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleRatingSubmit = (rating, review) => {
    console.log('Rating submitted:', { storeId: id, rating, review });
    setShowRatingModal(false);
    // In a real app, you would add the review to the list
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlaceholderImage = () => {
    const colors = ['4F46E5', '059669', 'DC2626', 'D97706', '7C3AED'];
    const colorIndex = (store?.name?.charCodeAt(0) || 0) % colors.length;
    return `https://via.placeholder.com/600x400/${colors[colorIndex]}/FFFFFF?text=${encodeURIComponent(store?.name?.charAt(0) || 'S')}`;
  };

  if (loading) {
    return (
      <div className="store-details-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading" />
            <p>Loading store details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-details-page">
        <div className="container">
          <div className="error-state glass-card">
            <h2>Store Not Found</h2>
            <p>The store you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              <FiArrowLeft />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-details-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-btn btn btn-secondary">
          <FiArrowLeft />
          Back
        </button>

        {/* Store Hero */}
        <div className="store-hero glass-card">
          <div className="store-image-large">
            <img 
              src={store.image || getPlaceholderImage()} 
              alt={store.name}
              onError={(e) => {
                e.target.src = getPlaceholderImage();
              }}
            />
            <div className="store-category-badge">{store.category}</div>
          </div>
          
          <div className="store-hero-content">
            <div className="store-header">
              <h1 className="store-title">{store.name}</h1>
              <div className="store-rating-display">
                <StarRating rating={store.rating} readonly size="medium" />
                <span className="rating-value">{store.rating}</span>
                <span className="rating-count">({store.totalRatings} reviews)</span>
              </div>
            </div>

            <div className="store-meta">
              <div className="meta-item">
                <FiMapPin />
                <span>{store.location}</span>
              </div>
              {store.phone && (
                <div className="meta-item">
                  <FiPhone />
                  <span>{store.phone}</span>
                </div>
              )}
              {store.website && (
                <div className="meta-item">
                  <FiGlobe />
                  <a href={store.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </div>
              )}
              {store.hours && (
                <div className="meta-item">
                  <FiClock />
                  <span>{store.hours}</span>
                </div>
              )}
            </div>

            {user && (
              <button 
                onClick={() => setShowRatingModal(true)}
                className="btn btn-primary rate-btn"
              >
                <FiStar />
                Rate This Store
              </button>
            )}
          </div>
        </div>

        {/* Store Details */}
        <div className="store-details-grid grid grid-2">
          <div className="store-info glass-card">
            <h2>About This Store</h2>
            <p className="store-description">{store.description}</p>
            
            {store.amenities && store.amenities.length > 0 && (
              <div className="amenities">
                <h3>Amenities</h3>
                <div className="amenities-list">
                  {store.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rating-breakdown glass-card">
            <h2>Rating Breakdown</h2>
            <div className="rating-stats">
              <div className="overall-rating">
                <div className="rating-number">{store.rating}</div>
                <StarRating rating={store.rating} readonly size="small" />
                <div className="total-reviews">{store.totalRatings} reviews</div>
              </div>
              
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map(stars => {
                  // Mock distribution - in real app, this would come from API
                  const percentage = stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2;
                  return (
                    <div key={stars} className="rating-bar-item">
                      <span className="stars-label">{stars} stars</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-bar-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section glass-card">
          <h2>Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this store!</p>
              {user && (
                <button 
                  onClick={() => setShowRatingModal(true)}
                  className="btn btn-primary"
                >
                  <FiStar />
                  Write a Review
                </button>
              )}
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <FiUser className="reviewer-avatar" />
                      <div>
                        <div className="reviewer-name">
                          {review.user}
                          {review.verified && (
                            <span className="verified-badge">Verified</span>
                          )}
                        </div>
                        <div className="review-meta">
                          <StarRating rating={review.rating} readonly size="small" />
                          <span className="review-date">
                            <FiCalendar />
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="review-content">
                    <p>{review.review}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          store={store}
          onSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

export default StoreDetails;
