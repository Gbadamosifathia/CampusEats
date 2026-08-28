import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import MenuItem from '../components/MenuItem';
import './RestaurantDetails.css';

// Hardcoded mock data for featured restaurants (IDs 1001+)
const MOCK_RESTAURANTS = {
  1001: {
    id: 1001,
    name: 'The Quad Grill',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: '4.8 (120+ ratings)',
    tags: 'Burgers & American',
    deliveryTime: '15-25 min',
    categories: ['Popular', 'Sides'],
    menu: {
      popular: [
        { id: 10001, title: 'Classic Quad Burger', description: 'Quarter pound smash patty, American cheese, crisp lettuce.', price: 3500, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', layout: 'horizontal' },
        { id: 10002, title: 'Spicy Chicken Sandwich', description: 'Crispy buttermilk fried chicken breast tossed in hot sauce.', price: 4000, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', layout: 'horizontal' },
      ],
      sides: [
        { id: 10003, title: 'Quad Fries', price: 1500, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', layout: 'grid' },
        { id: 10004, title: 'Mac & Cheese', price: 2000, image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', layout: 'grid' },
      ]
    }
  },
  1002: {
    id: 1002,
    name: 'Student Union Cafe',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: '4.5 (80+ ratings)',
    tags: 'Coffee & Light Bites',
    deliveryTime: '5-10 min',
    categories: ['Popular'],
    menu: {
      popular: [
        { id: 10005, title: 'Americano', description: 'Double shot espresso with hot water.', price: 1200, image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', layout: 'horizontal' },
        { id: 10006, title: 'Croissant', description: 'Butter croissant, freshly baked daily.', price: 800, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', layout: 'horizontal' },
      ],
      sides: []
    }
  },
};

function RestaurantDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const numericId = parseInt(id, 10);
  const isMock = numericId >= 1000;

  const { addToCart, cartTotalItems, cartTotal } = useCart();
  const { token } = useAuth();

  const [restaurantData, setRestaurantData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Popular');

  useEffect(() => {
    const load = async () => {
      if (isMock) {
        // Use hardcoded data
        const mock = MOCK_RESTAURANTS[numericId];
        if (mock) {
          setRestaurantData(mock);
          // Flatten mock menu into a list
          const allItems = [
            ...(mock.menu.popular || []),
            ...(mock.menu.sides || []),
          ];
          setMenuItems(allItems);
        }
        setLoading(false);
        return;
      }

      // Fetch real vendor data from API
      try {
        const [vendorRes, menuRes] = await Promise.all([
          fetch(`${API_URL}/api/vendor/${numericId}/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/menuitem_list/?vendor=${numericId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (vendorRes.ok) {
          const vendor = await vendorRes.json();
          setRestaurantData({
            id: vendor.id,
            name: vendor.name,
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rating: null,
            tags: vendor.description,
            deliveryTime: null,
            isOpen: vendor.is_open,
          });
        }

        if (menuRes.ok) {
          const items = await menuRes.json();
          // Map real menu items to the shape MenuItem component expects
          const mapped = items.map(item => ({
            id: item.id,
            title: item.name,
            description: '',
            price: parseFloat(item.price),
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            layout: 'horizontal',
          }));
          setMenuItems(mapped);
        }
      } catch (err) {
        console.error('Failed to load restaurant:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, token]);

  const handleAddToCart = (item) => {
    if (!restaurantData) return;
    addToCart(item, restaurantData.id, restaurantData.name);
  };

  if (loading) {
    return (
      <div className="restaurant-details-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#aaa' }}>Loading...</p>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="restaurant-details-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#aaa' }}>Restaurant not found.</p>
      </div>
    );
  }

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
            {restaurantData.rating && (
              <div className="rd-rating-meta">
                <Star size={12} fill="#ffc107" color="#ffc107" />
                <span>{restaurantData.rating} • {restaurantData.tags}</span>
              </div>
            )}
            {!restaurantData.rating && restaurantData.tags && (
              <div className="rd-rating-meta">
                <span>{restaurantData.tags}</span>
              </div>
            )}
            {restaurantData.deliveryTime && (
              <div className="rd-time-pill">
                <Clock size={12} />
                <span>{restaurantData.deliveryTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="rd-menu-content">
        {menuItems.length === 0 ? (
          <p style={{ padding: '20px', color: '#aaa', textAlign: 'center' }}>No menu items yet.</p>
        ) : (
          <section className="menu-section">
            <h3 className="menu-section-title">Menu</h3>
            <div className="menu-list">
              {menuItems.map(item => (
                <MenuItem key={item.id} item={item} onAdd={handleAddToCart} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Cart Button */}
      {cartTotalItems > 0 && (
        <div className="rd-bottom-cart-wrapper">
          <button className="rd-view-cart-btn" onClick={() => navigate('/checkout')}>
            <div className="cart-count">{cartTotalItems}</div>
            <div className="cart-center-text">
              <span className="cart-btn-title">View Cart</span>
              <span className="cart-btn-subtitle">{restaurantData.name}</span>
            </div>
            <div className="cart-total-price">₦{cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
          </button>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetails;
