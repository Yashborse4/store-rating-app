import React, { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import StarRating from './StarRating';
import './RatingModal.css';

const RatingModal = ({ store, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(rating, review);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="rating-modal glass-card">
        <div className="modal-header">
          <h2 className="modal-title">Rate Store</h2>
          <button 
            onClick={onClose} 
            className="close-btn"
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="store-info">
            <h3 className="store-name">{store?.name}</h3>
            <p className="store-location">{store?.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="rating-form">
            <div className="rating-section">
              <label className="rating-label">Your Rating</label>
              <div className="rating-input">
                <StarRating
                  rating={rating}
                  onRate={setRating}
                  readonly={false}
                  size="large"
                  showValue={true}
                />
              </div>
              <div className="rating-description">
                <span className="rating-text">
                  {rating === 0 && "Select a rating"}
                  {rating === 1 && "Poor - Very unsatisfied"}
                  {rating === 2 && "Fair - Somewhat unsatisfied"}
                  {rating === 3 && "Good - Neither satisfied nor unsatisfied"}
                  {rating === 4 && "Very Good - Satisfied"}
                  {rating === 5 && "Excellent - Very satisfied"}
                </span>
              </div>
            </div>

            <div className="review-section">
              <label htmlFor="review" className="review-label">
                Your Review (Optional)
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this store..."
                className="review-textarea"
                rows={4}
                maxLength={500}
                disabled={loading}
              />
              <div className="character-count">
                {review.length}/500
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || rating === 0}
              >
                {loading ? (
                  <div className="loading" />
                ) : (
                  <>
                    <FiStar />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
