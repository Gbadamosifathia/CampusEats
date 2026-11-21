import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Loader, Package } from 'lucide-react';
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

  const lastOrderId = localStorage.getItem('last_order_id');

  // Intercept Paystack redirect if Paystack sends user to /checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (reference) {
      // Forward immediately to /payment-success to verify and track the order
      navigate(`/payment-success?reference=${reference}`, { replace: true });
      return;
    }

    // If returned from Paystack without URL query params but order was initiated
    const awaitingPayment = sessionStorage.getItem('ce_awaiting_payment');
    if (awaitingPayment && lastOrderId && cartItems.length === 0) {
      sessionStorage.removeItem('ce_awaiting_payment');
      navigate(`/payment-success`, { replace: true });
    }
  }, [navigate, cartItems.length, lastOrderId]);

  const handlePayNow = async () => {
    if (cartItems.length === 0 || !restaurantId) return;
    setLoading(true);
    setError('');

    // Prevent checkout for mock restaurants (IDs >= 1000)
    if (parseInt(restaurantId, 10) >= 1000) {
      setError('Checkout is disabled for demo/mock restaurants. Please order from a real Campus Vendor!');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create the order (Backend handles items and totals)
      const orderRes = await fetch(`${API_URL}/api/order_list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendor: restaurantId,
          items: cartItems.map(item => ({
            menu_item: item.id,
            quantity: item.quantity
          }))
        }),
      });

      if (!orderRes.ok) {
        let errMessage = 'Failed to create order.';
        try {
          const err = await orderRes.json();
          errMessage = err.detail || JSON.stringify(err);
        } catch(e) {}
        throw new Error(errMessage);
      }
      const order = await orderRes.json();

      // Step 2: Initialize Paystack payment with callback_url
      const callbackUrl = `${window.location.origin}/payment-success`;
      const payRes = await fetch(`${API_URL}/api/payment/initialize/${order.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          callback_url: callbackUrl,
        })
      });

      if (!payRes.ok) {
        throw new Error('Failed to initialize payment. Please try again.');
      }

      const payData = await payRes.json();
      const authorizationUrl = payData?.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error('No payment URL returned from Paystack.');
      }

      // Step 3: Record tracking IDs before redirecting
      clearCart();
      localStorage.setItem('last_order_id', String(order.id));
      sessionStorage.setItem('ce_awaiting_payment', 'true');
      
      // Step 4: Redirect to Paystack
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
                {lastOrderId && (
                  <button 
                    className="track-existing-order-btn" 
                    onClick={() => navigate(`/order-tracking/${lastOrderId}`)}
                  >
                    <Package size={16} style={{ marginRight: '6px' }} />
                    Track Active Order #{lastOrderId} ➔
                  </button>
                )}
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
