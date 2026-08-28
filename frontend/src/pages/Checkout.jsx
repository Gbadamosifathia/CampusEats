import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import CartItem from '../components/CartItem';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, cartTotal, restaurantId, restaurantName, clearCart } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayNow = async () => {
    if (cartItems.length === 0 || !restaurantId) return;
    setLoading(true);
    setError('');

    try {
      // Step 1: Create the order
      const orderRes = await fetch(`${API_URL}/api/order_list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendor: restaurantId,
          total_amount: cartTotal,
          status: 'Pending',
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.detail || 'Failed to create order.');
      }
      const order = await orderRes.json();

      // Step 2: Create all order items
      await Promise.all(
        cartItems.map(item =>
          fetch(`${API_URL}/api/orderitem_list/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              order: order.id,
              menu_item: item.id,
              quantity: item.quantity,
              price_per_order: item.price,
            }),
          })
        )
      );

      // Step 3: Initialize Paystack payment
      const payRes = await fetch(`${API_URL}/api/payment/initialize/${order.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!payRes.ok) {
        throw new Error('Failed to initialize payment. Please try again.');
      }

      const payData = await payRes.json();
      const authorizationUrl = payData?.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error('No payment URL returned from Paystack.');
      }

      // Step 4: Clear cart and redirect to Paystack
      clearCart();
      // Save order ID so tracking page can find it after redirect
      localStorage.setItem('last_order_id', order.id);
      window.location.href = authorizationUrl;

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={24} color="#1c1c1e" />
        </button>
        <h1 className="checkout-title">Your Order</h1>
      </header>

      <main className="checkout-content">
        <section className="order-summary-section">
          <h2 className="section-title">
            Order Summary{' '}
            {restaurantName && (
              <span style={{ fontSize: '14px', color: '#8E8E93', fontWeight: 'normal' }}>
                from {restaurantName}
              </span>
            )}
          </h2>
          <div className="cart-items-list">
            {cartItems.length > 0 ? (
              cartItems.map(item => <CartItem key={item.id} item={item} />)
            ) : (
              <div className="empty-cart">
                <ShoppingBag size={48} color="#ddd" />
                <p>Your cart is empty.</p>
              </div>
            )}
          </div>
        </section>

        {error && <div className="checkout-error">{error}</div>}
      </main>

      <div className="checkout-bottom-sheet">
        <div className="price-breakdown">
          <div className="price-row">
            <span>Subtotal</span>
            <span>₦{cartSubtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="price-row">
            <span>Delivery Fee</span>
            <span className="free-tag">Free 🎉</span>
          </div>
        </div>

        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-price">₦{cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>

        <button
          className="pay-btn"
          disabled={cartItems.length === 0 || loading}
          onClick={handlePayNow}
          style={{ opacity: cartItems.length === 0 ? 0.5 : 1 }}
        >
          {loading ? (
            <><Loader size={20} className="spin" /> Processing...</>
          ) : (
            <>Pay ₦{cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })} with Paystack</>
          )}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
