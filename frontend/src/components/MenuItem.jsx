import React from 'react';
import { Plus } from 'lucide-react';
import './MenuItem.css';

function MenuItem({ item, onAdd }) {
  const { title, description, price, image, isPopular, layout } = item;

  if (layout === 'grid') {
    return (
      <div className="menu-item-grid">
        <div className="grid-image-container">
          <img src={image} alt={title} className="grid-image" />
          <button className="add-btn grid-add-btn" onClick={() => onAdd(item)}>
            <Plus size={16} color="#b03a25" />
          </button>
        </div>
        <h4 className="grid-title">{title}</h4>
        <span className="grid-price">${price.toFixed(2)}</span>
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className="menu-item-horizontal">
      <div className="menu-item-info">
        <div className="menu-item-header">
          <h4 className="menu-item-title">{title}</h4>
          {isPopular && <span className="popular-badge">Popular</span>}
        </div>
        <p className="menu-item-desc">{description}</p>
        <span className="menu-item-price">${price.toFixed(2)}</span>
      </div>
      <div className="menu-item-image-wrapper">
        <img src={image} alt={title} className="menu-item-image" />
        <button className="add-btn list-add-btn" onClick={() => onAdd(item)}>
          <Plus size={16} color="#b03a25" />
        </button>
      </div>
    </div>
  );
}

export default MenuItem;
