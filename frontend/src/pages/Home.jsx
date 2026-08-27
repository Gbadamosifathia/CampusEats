import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import RestaurantCard from '../components/RestaurantCard';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// Hardcoded "Featured" restaurants — IDs are 1001+ to avoid colliding with real DB IDs
export const FEATURED_RESTAURANTS = [
  {
    id: 1001,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.8,
    title: 'The Quad Grill',
    subtitle: 'Burgers, Fries & Shakes',
    deliveryTime: '10-15 min',
    distance: '0.2 mi',
    price: '$$'
  },
  {
    id: 1002,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.5,
    title: 'Student Union Cafe',
    subtitle: 'Coffee, Pastries & Light Bites',
    deliveryTime: '5-10 min',
    distance: '0.1 mi',
    price: '$$'
  },
  {
    id: 1003,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: false,
    rating: 4.2,
    title: 'Late Night Slices',
    subtitle: 'Pizza & Wings • Opens at 8PM',
    price: '$'
  },
  {
    id: 1004,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.9,
    title: 'Sakura Sushi',
    subtitle: 'Fresh Rolls & Bento Boxes',
    deliveryTime: '20-30 min',
    distance: '1.2 mi',
    price: '$$$'
  },
];

function Home() {
  const { token } = useAuth();
  const [realVendors, setRealVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendor_list/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Map real vendor shape to the shape RestaurantCard expects
          const mapped = data.map(v => ({
            id: v.id,             // real DB ID — will hit the API in RestaurantDetails
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
    return list.filter(r => {
      // Search text filter
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (r.subtitle && r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      let matchesCategory = true;
      if (activeCategory !== 'all') {
        const text = (r.title + " " + (r.subtitle || '')).toLowerCase();
        if (activeCategory === 'burgers') {
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
      <TopBar />
      <SearchBar 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
      />
      <CategoryFilter 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <main className="main-content">
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
            <p style={{ padding: '0 20px', color: '#aaa', fontSize: '14px' }}>No favorites match your search.</p>
          )}
        </div>

        {/* Real Vendor Section */}
        <div className="section-header" style={{ marginTop: '28px' }}>
          <h2>Campus Vendors</h2>
        </div>
        {loadingVendors ? (
          <p style={{ padding: '0 20px', color: '#aaa', fontSize: '14px' }}>Loading vendors...</p>
        ) : filteredVendors.length === 0 ? (
          <p style={{ padding: '0 20px', color: '#aaa', fontSize: '14px' }}>No vendors match your search.</p>
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
