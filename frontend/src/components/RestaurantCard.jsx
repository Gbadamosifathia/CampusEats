import React from 'react';
import { Star, Heart, Clock, Footprints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

function RestaurantCard({ data }) {
  const { 
    image, 
    isOpen, 
    rating, 
    title, 
    subtitle, 
    deliveryTime, 
    distance, 
    price 
  } = data;
  
  const navigate = useNavigate();

  return (
    <div className="restaurant-card" onClick={() => navigate(`/restaurant/${data.id}`)} style={{cursor: 'pointer'}}>
      <div className="card-image-container">
        <img src={image} alt={title} className="card-image" />
        
        <div className="card-badges-top">
          <div className="badge status-badge">
            <span className={`status-dot ${isOpen ? 'open' : 'closed'}`}></span>
            <span className="status-text">{isOpen ? 'Open' : 'Closed'}</span>
          </div>
          
          <div className="badge rating-badge">
            <Star size={12} fill="#ffc107" color="#ffc107" />
            <span className="rating-text">{rating}</span>
          </div>
        </div>

        <button className="favorite-btn" aria-label="Add to favorites">
          <Heart size={20} color="#6a5e5c" />
        </button>
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-subtitle">{subtitle}</p>
        
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
            <div className="info-chip price-chip">
              <span>{price}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
