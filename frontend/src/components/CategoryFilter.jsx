import React, { useState } from 'react';
import { Utensils, Pizza, Leaf } from 'lucide-react';
import './CategoryFilter.css';

const categories = [
  { id: 'all', label: 'All', icon: <Utensils size={16} /> },
  { id: 'burgers', label: 'Burgers', icon: <Utensils size={16} /> },
  { id: 'pizza', label: 'Pizza', icon: <Pizza size={16} /> },
  { id: 'healthy', label: 'Healthy', icon: <Leaf size={16} /> }
];

function CategoryFilter() {
  const [activeId, setActiveId] = useState('all');

  return (
    <div className="category-scroll-container">
      <div className="category-list">
        {categories.map((cat) => (
          <button 
            key={cat.id} 
            className={`category-pill ${activeId === cat.id ? 'active' : ''}`}
            onClick={() => setActiveId(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
