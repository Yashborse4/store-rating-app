import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import './StarRating.css';

const StarRating = ({ 
  rating = 0, 
  onRate, 
  readonly = false, 
  size = 'medium',
  showValue = false 
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleStarClick = (starRating) => {
    if (readonly) return;
    
    setCurrentRating(starRating);
    if (onRate) {
      onRate(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (readonly) return;
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const displayRating = hoveredRating || currentRating;
    const isFilled = starValue <= displayRating;
    const isHalf = !isFilled && starValue - 0.5 <= displayRating;

    return (
      <div
        key={index}
        className={`star-wrapper ${size}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        onMouseLeave={handleStarLeave}
      >
        <FiStar 
          className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''} ${!readonly ? 'interactive' : ''}`}
        />
        {isHalf && (
          <FiStar className="star star-half-fill" />
        )}
      </div>
    );
  };

  return (
    <div className={`star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}>
      <div className="stars">
        {[...Array(5)].map((_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className="rating-text">
          {(hoveredRating || currentRating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
