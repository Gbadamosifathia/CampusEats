import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, deliveryFee, tax, cartTotal, restaurantName } = useCart();

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button className="back-btn" onClick={() => navigate('/')} aria-label="Go back">
          <ArrowLeft size={24} color="#1c1c1e" />
        </button>
        <h1 className="checkout-title">Checkout</h1>
      </header>

      <main className="checkout-content">
        <section className="order-summary-section">
          <h2 className="section-title">Order Summary {restaurantName && <span style={{fontSize: '14px', color: '#8E8E93', fontWeight: 'normal'}}>from {restaurantName}</span>}</h2>
          <div className="cart-items-list">
            {cartItems.length > 0 ? (
              cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))
            ) : (
              <p style={{color: '#8E8E93'}}>Your cart is empty.</p>
            )}
          </div>
        </section>

        <section className="delivery-instructions-section">
          <h2 className="section-title">Delivery Instructions</h2>
          <label className="instructions-label">NOTE FOR THE RIDER</label>
          <textarea 
            className="instructions-input" 
            placeholder="e.g., Leave at the front desk of the..."
            rows={3}
          ></textarea>
        </section>
      </main>

      <div className="checkout-bottom-sheet">
        <div className="price-breakdown">
          <div className="price-row">
            <span>Subtotal</span>
            <span>${cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Taxes & Fees</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-price">${cartTotal.toFixed(2)}</span>
        </div>

        <button className="pay-btn" disabled={cartItems.length === 0} style={{opacity: cartItems.length === 0 ? 0.5 : 1}}>
          <CreditCard size={20} />
          Pay with Paystack
        </button>
      </div>
    </div>
  );
}

export default Checkout;
