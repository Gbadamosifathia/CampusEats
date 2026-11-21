import React, { useState, useEffect } from 'react';
import { Clock, Search, X, TrendingUp, Sparkles } from 'lucide-react';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { FEATURED_RESTAURANTS } from './Home';
import './Search.css';

const POPULAR_CATEGORIES = [
  { name: 'Fast Food', emoji: '🍔', desc: 'Burgers & Fries' },
  { name: 'Local Kitchen', emoji: '🍲', desc: 'Jollof, Rice & Soups' },
  { name: 'Pizza', emoji: '🍕', desc: 'Slices & Pies' },
  { name: 'Healthy & Bowls', emoji: '🥗', desc: 'Salads & Fresh Wraps' },
  { name: 'Pastries & Sweets', emoji: '🧁', desc: 'Cakes & Pastries' },
  { name: 'Coffee & Drinks', emoji: '☕', desc: 'Coffee, Teas & Boba' },
];

function SearchPage() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [realVendors, setRealVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('ce_recent_searches');
      return saved ? JSON.parse(saved) : ['Pizza', 'Burger', 'Jollof', 'Coffee'];
    } catch {
      return ['Pizza', 'Burger', 'Jollof', 'Coffee'];
    }
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/vendor_list/`, { headers });
        if (res.ok) {
          const data = await res.json();
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

  const handleSelectSearch = (term) => {
    setSearchQuery(term);
    saveSearch(term);
  };

  const saveSearch = (term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('ce_recent_searches', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('ce_recent_searches');
    } catch { }
  };

  const filterRestaurants = (list) => {
    if (!searchQuery.trim() || !list) return [];
    const query = searchQuery.toLowerCase().trim();
    return list.filter(r => {
      const titleMatch = r.title && r.title.toLowerCase().includes(query);
      const subtitleMatch = r.subtitle && r.subtitle.toLowerCase().includes(query);
      return titleMatch || subtitleMatch;
    });
  };

  const allRestaurants = [...(FEATURED_RESTAURANTS || []), ...realVendors];
  const searchResults = filterRestaurants(allRestaurants);

  return (
    <div className="search-page">
      <TopBar>
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search food, restaurants, or groceries..."
        />
      </TopBar>

      <div className="search-content">
        {searchQuery.trim() === '' ? (
          <>
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <section className="search-section">
                <div className="section-header-row">
                  <h3 className="section-title">
                    <Clock size={16} /> Recent Searches
                  </h3>
                  <button className="clear-history-btn" onClick={handleClearRecent}>
                    Clear all
                  </button>
                </div>
                <div className="chip-group">
                  {recentSearches.map((item, index) => (
                    <button
                      key={index}
                      className="search-chip"
                      onClick={() => handleSelectSearch(item)}
                    >
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Categories Grid */}
            <section className="search-section">
              <div className="section-header-row">
                <h3 className="section-title">
                  <TrendingUp size={16} /> Popular Categories
                </h3>
              </div>
              <div className="category-grid">
                {POPULAR_CATEGORIES.map((cat, index) => (
                  <div
                    key={index}
                    className="category-card"
                    onClick={() => handleSelectSearch(cat.name)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="category-emoji">{cat.emoji}</span>
                    <div className="category-text-block">
                      <h4 className="category-name">{cat.name}</h4>
                      <p className="category-desc">{cat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Search Results */
          <section className="search-section">
            <div className="search-results-header">
              <div>
                <h3 className="section-title">
                  Results for "{searchQuery}"
                </h3>
                <p className="results-count">
                  {searchResults.length} {searchResults.length === 1 ? 'place' : 'places'} found
                </p>
              </div>
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} /> Clear Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="restaurant-list">
                {searchResults.map(restaurant => (
                  <RestaurantCard key={restaurant.id} data={restaurant} />
                ))}
              </div>
            ) : (
              <div className="no-results-card">
                <div className="no-results-icon-wrap">
                  <Search size={36} color="#8e8e93" />
                </div>
                <h4>No places found</h4>
                <p>We couldn't find anything matching "<strong>{searchQuery}</strong>".</p>
                <div className="no-results-suggestions">
                  <span>Try searching for:</span>
                  <div className="chip-group" style={{ justifyContent: 'center', marginTop: '10px' }}>
                    {['Burger', 'Pizza', 'Jollof', 'Coffee'].map((term, i) => (
                      <button
                        key={i}
                        className="search-chip"
                        onClick={() => handleSelectSearch(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
