import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import StarRating from './StarRating';
import './StoreCard.css';

const StoreCard = ({ store, showActions = false, onRate }) => {
  const {
    id,
    name,
    category,
    location,
    image,
    rating,
    totalRatings,
    description
  } = store;

  // Generate placeholder image based on store name
  const getPlaceholderImage = () => {
    const colors = ['4F46E5', '059669', 'DC2626', 'D97706', '7C3AED'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return `https://via.placeholder.com/300x200/${colors[colorIndex]}/FFFFFF?text=${encodeURIComponent(name.charAt(0))}`;
  };

  const imageUrl = image || getPlaceholderImage();

  return (
    <div className="store-card glass-card">
      <div className="store-image">
        <img 
          src={imageUrl} 
          alt={name}
          onError={(e) => {
            e.target.src = getPlaceholderImage();
          }}
        />
        <div className="store-category">{category}</div>
      </div>
      
      <div className="store-content">
        <div className="store-header">
          <h3 className="store-name">{name}</h3>
          <div className="store-location">
            <FiMapPin />
            <span>{location}</span>
          </div>
        </div>

        <p className="store-description">{description}</p>

        <div className="store-rating">
          <div className="rating-display">
            <StarRating rating={rating} readonly size="small" />
            <span className="rating-value">{rating}</span>
            <span className="rating-count">({totalRatings} reviews)</span>
          </div>
        </div>

        {showActions && (
          <div className="store-actions">
            <button 
              onClick={() => onRate && onRate(store)} 
              className="btn btn-secondary btn-small"
            >
              <FiStar />
              Rate Store
            </button>
            <Link 
              to={`/store/${id}`} 
              className="btn btn-primary btn-small"
            >
              View Details
            </Link>
          </div>
        )}

        {!showActions && (
          <div className="store-footer">
            <Link 
              to={`/store/${id}`} 
              className="store-link"
            >
              View Details
              <FiStar />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCard;
