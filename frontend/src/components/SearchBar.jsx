import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

function SearchBar() {
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} strokeWidth={2} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="What are you craving?" 
        />
      </div>
    </div>
  );
}

export default SearchBar;
