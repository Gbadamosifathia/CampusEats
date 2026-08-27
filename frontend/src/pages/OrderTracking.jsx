import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Clock, Package, ChefHat } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './OrderTracking.css';

const STEPS = [
  {
    key: 'Pending',
    label: 'Order Placed',
    icon: CheckCircle,
    description: 'Your order has been received!',
  },
  {
    key: 'Preparing',
    label: 'Kitchen is Preparing',
    icon: ChefHat,
    description: 'Your chef is on it.',
  },
  {
    key: 'Completed',
    label: 'Ready for Pickup',
    icon: Package,
    description: 'Head over to collect your meal!',
  },
];

// Maps each backend status to its visual step index (0-based)
const STATUS_TO_STEP = {
  'Pending':   0,
  'Paid':      0, // Paid = order placed & confirmed, same visual step
  'Preparing': 1,
  'Completed': 2,
  'Cancelled': 2, // show on last step, card will reflect cancellation
};

function getStepIndex(status) {
  return STATUS_TO_STEP[status] ?? 0;
}

function OrderTracking() {
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams();
  const { token } = useAuth();

  // Support both route param and localStorage fallback (for post-Paystack redirect)
  const orderId = paramOrderId || localStorage.getItem('last_order_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  const fetchOrder = async () => {
    if (!orderId || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/order/${orderId}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        // Stop polling once order is completed or cancelled
        if (data.status === 'Completed' || data.status === 'Cancelled') {
          clearInterval(intervalRef.current);
        }
      } else {
        setError('Could not load order details.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 12 seconds for live updates
    intervalRef.current = setInterval(fetchOrder, 12000);
    return () => clearInterval(intervalRef.current);
  }, [orderId, token]);

  const activeStepIndex = order ? getStepIndex(order.status) : 0;

  // Estimate pickup time (10-20 min from now)
  const pickupTime = new Date(Date.now() + 15 * 60 * 1000);
  const pickupStr = pickupTime.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="ot-page ot-loading">
        <div className="ot-spinner" />
        <p>Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="ot-page ot-error">
        <p>{error || 'Order not found.'}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const isCompleted = order.status === 'Completed';

  return (
    <div className="ot-page">
      <header className="ot-header">
        <button className="ot-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={22} color="#1c1c1e" />
        </button>
        <h1>Order Tracking</h1>
      </header>

      <div className="ot-estimated">
        <p className="ot-estimated-label">ESTIMATED PICKUP</p>
        <p className="ot-time">{isCompleted ? 'Ready Now! 🎉' : pickupStr}</p>
        <div className="ot-status-pill">
          {isCompleted ? '✅ Ready for pickup!' : '🍳 Kitchen is cooking!'}
        </div>
      </div>

      <div className="ot-bag-wrapper">
        <div className={`ot-bag-glow ${isCompleted ? 'ready' : ''}`}>
          <span className="ot-bag-emoji">🛍️</span>
        </div>
      </div>

      <div className="ot-steps">
        {STEPS.map((step, index) => {
          const isPast = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className={`ot-step ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}`}>
              <div className="ot-step-left">
                <div className={`ot-step-icon ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}`}>
                  {isPast ? <CheckCircle size={20} /> : <Icon size={20} />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`ot-step-line ${isPast ? 'past' : ''}`} />
                )}
              </div>
              <div className="ot-step-content">
                <p className={`ot-step-label ${isActive ? 'active' : ''}`}>{step.label}</p>
                {isActive && <p className="ot-step-desc">{step.description}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ot-receipt">
        <div className="ot-receipt-header">
          <span className="ot-order-id">ORDER #{order.id}</span>
          <span className="ot-receipt-tag">Receipt</span>
        </div>
        <div className="ot-receipt-total">
          <span>Total</span>
          <span className="ot-amount">₦{parseFloat(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="ot-refresh-hint">
        <Clock size={13} />
        <span>Auto-updating every 12 seconds</span>
      </div>
    </div>
  );
}

export default OrderTracking;
