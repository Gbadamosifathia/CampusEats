import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import RestaurantCard from '../components/RestaurantCard';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export const FEATURED_RESTAURANTS = [
  {
    id: 1001,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.8,
    title: 'The Quad Diner',
    subtitle: 'Classic burgers & loaded fries',
    deliveryTime: '15-20 min',
    distance: '0.2 mi',
    price: '$$'
  },
  {
    id: 1002,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: false,
    rating: 4.6,
    title: 'Brew & Byte Cafe',
    subtitle: 'Artisan coffee & pastries',
    deliveryTime: '10-15 min',
    distance: '0.1 mi',
    price: '$'
  },
  {
    id: 1003,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.9,
    title: 'Pizza Corner',
    subtitle: 'Wood-fired slices & calzones',
    deliveryTime: '20-30 min',
    distance: '0.5 mi',
    price: '$$'
  },
  {
    id: 1004,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.7,
    title: 'Green Garden Bowl',
    subtitle: 'Salads, bowls & fresh juices',
    deliveryTime: '15-25 min',
    distance: '1.2 mi',
    price: '$$$'
  },
];

function Home() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [realVendors, setRealVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Intercept Paystack payment return if redirected to home
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (reference) {
      navigate(`/payment-success?reference=${reference}`, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/vendor_list/`, { headers });
        if (res.ok) {
          const data = await res.json();
          // Map real vendor shape to the shape RestaurantCard expects
          const mapped = data.map(v => ({
            id: v.id,
            image: v.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            isOpen: v.is_open,
            rating: null,
            title: v.name,
            subtitle: v.description,
            price: null,
          }));
          setRealVendors(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, [token]);

  const filterRestaurants = (list) => {
    if (!list) return [];
    return list.filter(r => {
      // Search text filter
      const titleMatch = r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const subtitleMatch = r.subtitle && r.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || subtitleMatch;
      
      // Category filter
      let matchesCategory = true;
      if (activeCategory !== 'all') {
        const text = `${r.title} ${r.subtitle}`.toLowerCase();
        if (activeCategory === 'burger') {
          matchesCategory = text.includes('burger');
        } else if (activeCategory === 'pizza') {
          matchesCategory = text.includes('pizza');
        } else if (activeCategory === 'healthy') {
          matchesCategory = text.includes('healthy') || text.includes('salad') || text.includes('fresh') || text.includes('sushi');
        }
      }
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredFeatured = filterRestaurants(FEATURED_RESTAURANTS);
  const filteredVendors = filterRestaurants(realVendors);

  return (
    <>
      <TopBar>
        <SearchBar 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </TopBar>
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <main className="main-content">
        <div className="home-greeting" style={{ marginTop: '10px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            {user?.first_name ? `Good morning, ${user.first_name}!` : 'Welcome to CampusEats!'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Ready for some good food?</p>
        </div>
        
        {/* Featured / Hardcoded Section */}
        <div className="section-header">
          <h2>Campus Favorites</h2>
          <a href="#" className="see-all">See all</a>
        </div>
        <div className="restaurant-list">
          {filteredFeatured.length > 0 ? (
            filteredFeatured.map(restaurant => (
              <RestaurantCard key={restaurant.id} data={restaurant} />
            ))
          ) : (
            <p style={{ padding: '0 20px', color: 'var(--text-muted)', fontSize: '14px' }}>No favorites match your search.</p>
          )}
        </div>

        {/* Real Vendor Section */}
        <div className="section-header" style={{ marginTop: '28px' }}>
          <h2>Campus Vendors</h2>
        </div>
        {loadingVendors ? (
          <p style={{ padding: '0 20px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading vendors...</p>
        ) : filteredVendors.length === 0 ? (
          searchQuery.trim() ? (
            <p style={{ padding: '0 20px', color: 'var(--text-muted)', fontSize: '14px' }}>No vendors match "{searchQuery}".</p>
          ) : !token ? (
            <div style={{
              margin: '0 20px',
              padding: '24px 20px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Want to explore all campus kitchens?
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Log in to see all student kitchens, view custom menus, and place orders directly.
              </p>
              <a
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '9px 22px',
                  borderRadius: '20px',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px var(--accent-shadow)'
                }}
              >
                Log In / Sign Up
              </a>
            </div>
          ) : (
            <p style={{ padding: '0 20px', color: 'var(--text-muted)', fontSize: '14px' }}>No vendors available at the moment.</p>
          )
        ) : (
          <div className="restaurant-list">
            {filteredVendors.map(vendor => (
              <RestaurantCard key={vendor.id} data={vendor} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
