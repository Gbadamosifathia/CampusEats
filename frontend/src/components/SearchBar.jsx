import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

function SearchBar({ value, onChange, placeholder = "What are you craving?" }) {
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} strokeWidth={2} />
        <input 
          type="text" 
          className="search-input" 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
        />
        {value && (
          <button 
            type="button" 
            className="search-clear-btn" 
            onClick={handleClear} 
            aria-label="Clear search input"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
