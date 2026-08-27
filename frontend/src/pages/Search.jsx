import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import TopBar from '../components/TopBar';
import RestaurantCard from '../components/RestaurantCard';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { FEATURED_RESTAURANTS } from './Home';
import './Search.css';

function SearchPage() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [realVendors, setRealVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const recentSearches = ['Pizza', 'Burger', 'Sushi'];
  const categories = ['Fast Food', 'Healthy', 'Desserts', 'Coffee'];

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendor_list/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(v => ({
            id: v.id,
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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

    if (token) fetchVendors();
  }, [token]);

  const filterRestaurants = (list) => {
    if (!searchQuery.trim() || !list) return [];
    return list.filter(r => {
      const titleMatch = r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const subtitleMatch = r.subtitle && r.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || subtitleMatch;
    });
  };

  const filteredFeatured = filterRestaurants(FEATURED_RESTAURANTS);
  const filteredVendors = filterRestaurants(realVendors);
  
  const handlePillClick = (term) => {
    setSearchQuery(term);
  };

  return (
    <>
      <TopBar />
      <div className="search-page-container">
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="search-content">
          {!searchQuery.trim() ? (
            <>
              <section className="search-section">
                <h3>Recent Searches</h3>
                <div className="pill-container">
                  {recentSearches.map((item, index) => (
                    <button key={index} className="search-pill" onClick={() => handlePillClick(item)}>{item}</button>
                  ))}
                </div>
              </section>

              <section className="search-section">
                <h3>Popular Categories</h3>
                <div className="pill-container">
                  {categories.map((item, index) => (
                    <button key={index} className="search-pill category-pill" onClick={() => handlePillClick(item)}>{item}</button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="search-results">
              <section className="search-section">
                <h3>Search Results for "{searchQuery}"</h3>
                
                {filteredFeatured.length === 0 && filteredVendors.length === 0 && !loadingVendors ? (
                  <p style={{ color: '#aaa', fontSize: '14px', marginTop: '10px' }}>No restaurants found matching your search.</p>
                ) : null}

                <div className="restaurant-list">
                  {filteredFeatured.map(restaurant => (
                    <RestaurantCard key={restaurant.id} data={restaurant} />
                  ))}
                  {filteredVendors.map(vendor => (
                    <RestaurantCard key={vendor.id} data={vendor} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchPage;
