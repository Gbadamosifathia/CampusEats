import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartItem.css';

function CartItem({ item }) {
  const { id, image, title, subtitle, price, quantity } = item;
  const { updateQuantity } = useCart();

  return (
    <div className="cart-item">
      <img src={image} alt={title} className="cart-item-image" />
      <div className="cart-item-details">
        <div className="cart-item-header">
          <h4 className="cart-item-title">{title}</h4>
          <span className="cart-item-price">${price.toFixed(2)}</span>
        </div>
        <p className="cart-item-subtitle">{subtitle}</p>
        <div className="cart-item-actions">
          <div className="quantity-selector">
            <button className="quantity-btn" onClick={() => updateQuantity(id, -1)} aria-label="Decrease quantity">
              <Minus size={14} />
            </button>
            <span className="quantity-value">{quantity}</span>
            <button className="quantity-btn plus" onClick={() => updateQuantity(id, 1)} aria-label="Increase quantity">
              <Plus size={14} color="#D9534F" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
