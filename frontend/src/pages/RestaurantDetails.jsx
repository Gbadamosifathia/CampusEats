import React, { useState } from 'react';
import { ArrowLeft, Clock, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import MenuItem from '../components/MenuItem';
import './RestaurantDetails.css';

// Mock data for this restaurant
const restaurantData = {
  id: 1, // matches The Quad Grill
  name: 'The Quad Grill',
  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  rating: '4.8 (120+ ratings)',
  tags: 'Burgers & American',
  deliveryTime: '15-25 min',
  categories: ['Popular', 'Mains', 'Sides', 'Drinks'],
  menu: {
    popular: [
      {
        id: 101,
        title: 'Classic Quad Burger',
        description: 'Quarter pound smash patty, American cheese, crisp...',
        price: 8.50,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        isPopular: true,
        layout: 'horizontal'
      },
      {
        id: 102,
        title: 'Spicy Chicken Sandwich',
        description: 'Crispy buttermilk fried chicken breast tossed in...',
        price: 9.00,
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        isPopular: false,
        layout: 'horizontal'
      }
    ],
    sides: [
      {
        id: 103,
        title: 'Quad Fries',
        price: 3.50,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        layout: 'grid'
      },
      {
        id: 104,
        title: 'Mac & Cheese',
        price: 4.00,
        image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        layout: 'grid'
      }
    ]
  }
};

function RestaurantDetails() {
  const navigate = useNavigate();
  const { id } = useParams(); // Using this for routing, but falling back to mock data
  const { addToCart, cartTotalItems, cartTotal, restaurantId } = useCart();
  const [activeCategory, setActiveCategory] = useState('Popular');

  const handleAddToCart = (item) => {
    // Pass restaurant ID and Name to context
    addToCart(item, restaurantData.id, restaurantData.name);
  };

  return (
    <div className="restaurant-details-page">
      <header className="rd-header">
        <button className="rd-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} color="#1c1c1e" />
        </button>
        <h1 className="rd-title">Restaurant Details</h1>
      </header>

      <div className="rd-hero">
        <img src={restaurantData.image} alt={restaurantData.name} className="rd-hero-image" />
        <div className="rd-hero-overlay">
          <h2 className="rd-hero-title">{restaurantData.name}</h2>
          <div className="rd-hero-meta">
            <div className="rd-rating-meta">
              <Star size={12} fill="#ffc107" color="#ffc107" />
              <span>{restaurantData.rating} • {restaurantData.tags}</span>
            </div>
            <div className="rd-time-pill">
              <Clock size={12} />
              <span>{restaurantData.deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rd-category-scroll">
        {restaurantData.categories.map(cat => (
          <button 
            key={cat} 
            className={`rd-cat-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="rd-menu-content">
        <section className="menu-section">
          <h3 className="menu-section-title">Popular Items</h3>
          <div className="menu-list">
            {restaurantData.menu.popular.map(item => (
              <MenuItem key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
        </section>

        <section className="menu-section">
          <h3 className="menu-section-title">Sides</h3>
          <div className="menu-grid">
            {restaurantData.menu.sides.map(item => (
              <MenuItem key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Cart Button */}
      {cartTotalItems > 0 && (
        <div className="rd-bottom-cart-wrapper">
          <button className="rd-view-cart-btn" onClick={() => navigate('/checkout')}>
            <div className="cart-count">{cartTotalItems}</div>
            <div className="cart-center-text">
              <span className="cart-btn-title">View Cart</span>
              <span className="cart-btn-subtitle">{restaurantId === restaurantData.id ? restaurantData.name : 'Multiple Restaurants'}</span>
            </div>
            <div className="cart-total-price">${cartTotal.toFixed(2)}</div>
          </button>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetails;
