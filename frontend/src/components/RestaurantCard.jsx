import React, { useState } from 'react';
import { Star, Heart, Clock, Footprints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

const DEFAULT_REST_IMG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

function RestaurantCard({ data }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  if (!data) return null;

  const { 
    id,
    image, 
    image_url,
    isOpen, 
    is_open,
    rating, 
    title, 
    name,
    subtitle, 
    description,
    deliveryTime, 
    distance, 
    price 
  } = data;
  
  // Resilient field fallbacks for both frontend mocks and backend API objects
  const displayId = id;
  const displayTitle = title || name || 'Restaurant';
  const displaySubtitle = subtitle || description || '';
  const displayIsOpen = isOpen !== undefined ? isOpen : (is_open !== undefined ? is_open : true);
  const displayImage = image || image_url || DEFAULT_REST_IMG;

  const handleCardClick = () => {
    if (displayId) {
      navigate(`/restaurant/${displayId}`);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card navigation when clicking favorite heart
    setIsFavorite(prev => !prev);
  };

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_REST_IMG;
  };

  return (
    <div className="restaurant-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="card-image-container">
        <img 
          src={displayImage} 
          alt={displayTitle} 
          className="card-image"
          onError={handleImageError}
        />
        
        <div className="card-badges-top">
          <div className="badge status-badge">
            <span className={`status-dot ${displayIsOpen ? 'open' : 'closed'}`}></span>
            <span className="status-text">{displayIsOpen ? 'Open' : 'Closed'}</span>
          </div>
          
          {rating ? (
            <div className="badge rating-badge">
              <Star size={12} fill="#ffc107" color="#ffc107" />
              <span className="rating-text">{rating}</span>
            </div>
          ) : null}
        </div>

        <button 
          className={`favorite-btn ${isFavorite ? 'favorited' : ''}`} 
          onClick={handleFavoriteClick}
          aria-label="Add to favorites"
        >
          <Heart 
            size={20} 
            color={isFavorite ? '#f05a28' : '#6a5e5c'} 
            fill={isFavorite ? '#f05a28' : 'none'} 
          />
        </button>
      </div>

      <div className="card-content">
        <h3 className="card-title">{displayTitle}</h3>
        {displaySubtitle && <p className="card-subtitle">{displaySubtitle}</p>}
        
        <div className="card-info-chips">
          {deliveryTime && (
            <div className="info-chip">
              <Clock size={12} />
              <span>{deliveryTime}</span>
            </div>
          )}
          {distance && (
            <div className="info-chip">
              <Footprints size={12} />
              <span>{distance}</span>
            </div>
          )}
          {price && (
            <div className="info-chip">
              <span>{price}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
