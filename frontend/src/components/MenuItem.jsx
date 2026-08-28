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
        </div>
        <h4 className="grid-title">{title}</h4>
        <div className="menu-item-action-row">
          <span className="grid-price">₦{price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          <button className="add-to-cart-btn" onClick={() => onAdd(item)}>
            <Plus size={14} /> Add
          </button>
        </div>
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
        <div className="menu-item-action-row">
          <span className="menu-item-price">₦{price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          <button className="add-to-cart-btn" onClick={() => onAdd(item)}>
            <Plus size={14} /> Add to cart
          </button>
        </div>
      </div>
      <div className="menu-item-image-wrapper">
        <img src={image} alt={title} className="menu-item-image" />
      </div>
    </div>
  );
}

export default MenuItem;
