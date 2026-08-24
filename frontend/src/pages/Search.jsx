import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import TopBar from '../components/TopBar';
import './Search.css';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // We could fetch trending or recent searches here
  const recentSearches = ['Pizza', 'Burger', 'Sushi'];
  const categories = ['Fast Food', 'Healthy', 'Desserts', 'Coffee'];

  return (
    <>
      <TopBar />
      <div className="search-page-container">
        {/* We can pass props to SearchBar later to handle state if needed, 
            or keep it self-contained for now. */}
        <SearchBar />
        
        <div className="search-content">
          <section className="search-section">
            <h3>Recent Searches</h3>
            <div className="pill-container">
              {recentSearches.map((item, index) => (
                <button key={index} className="search-pill">{item}</button>
              ))}
            </div>
          </section>

          <section className="search-section">
            <h3>Popular Categories</h3>
            <div className="pill-container">
              {categories.map((item, index) => (
                <button key={index} className="search-pill category-pill">{item}</button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default SearchPage;
