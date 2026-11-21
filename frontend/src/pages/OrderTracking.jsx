import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, Clock, Package, ChefHat, XCircle, Home } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { showBrowserNotification, playNotificationChime } from '../utils/notifications';
import './OrderTracking.css';

const STEPS = [
  {
    key: 'placed',
    label: 'Order Placed',
    icon: CheckCircle,
    description: 'Your order has been received and confirmed!',
  },
  {
    key: 'preparing',
    label: 'Kitchen is Preparing',
    icon: ChefHat,
    description: 'Your chef is cooking your meal.',
  },
  {
    key: 'completed',
    label: 'Ready for Pickup',
    icon: Package,
    description: 'Head over to collect your meal!',
  },
];

function getStepIndex(status) {
  const s = (status || '').toLowerCase();
  if (s === 'preparing') return 1;
  if (s === 'completed' || s === 'cancelled') return 2;
  return 0; // pending, paid
}

function OrderTracking() {
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams();
  const { token, isVendor } = useAuth();

  // Support route param, localStorage fallback, or query param
  const resolvedOrderId = paramOrderId || localStorage.getItem('last_order_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prevStatusRef = useRef(null);
  const isPollingRef = useRef(true);

  const fetchOrder = async () => {
    if (!resolvedOrderId) {
      setError('No active order found. Please place an order first.');
      setLoading(false);
      return true; // Stop polling
    }
    if (!token) {
      setError('Please log in to track your order.');
      setLoading(false);
      return true; // Stop polling
    }

    try {
      const res = await fetch(`${API_URL}/api/order/${resolvedOrderId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        const data = await res.json();
        const currentStatus = (data.status || '').toLowerCase();
        
        // Notify student when order status changes after initial load
        if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
          playNotificationChime();
          if (currentStatus === 'completed') {
            showBrowserNotification('Order Ready for Pickup! 🎉', {
              body: `Your order #${data.id} is ready for pickup at the counter!`,
              tag: `student-order-${data.id}`,
            });
          } else if (currentStatus === 'preparing') {
            showBrowserNotification('Kitchen is Preparing Your Meal! 🍳', {
              body: `The chef is now preparing order #${data.id}.`,
              tag: `student-order-${data.id}`,
            });
          }
        }
        prevStatusRef.current = currentStatus;

        setOrder(data);
        setError('');
        setLoading(false);

        // Return true if finished to stop future polls
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
          return true;
        }
        return false;
      } else {
        if (res.status === 404 || res.status === 401) {
          localStorage.removeItem('last_order_id');
          if (isVendor) {
            setError('This is the customer tracking screen. To manage your restaurant orders, open your Vendor Dashboard.');
          } else {
            setError('Could not find active order details.');
          }
          setLoading(false);
          return true; // Stop polling immediately
        }
        setError('Could not load order details. Please check your order history.');
        setLoading(false);
        return false;
      }
    } catch {
      setError('Network error. Trying to reconnect...');
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    isPollingRef.current = true;
    let timer = null;

    const poll = async () => {
      if (!isPollingRef.current) return;
      const isDone = await fetchOrder();
      if (!isDone && isPollingRef.current) {
        timer = setTimeout(poll, 12000);
      }
    };

    poll();

    return () => {
      isPollingRef.current = false;
      if (timer) clearTimeout(timer);
    };
  }, [resolvedOrderId, token]);

  if (loading) {
    return (
      <div className="ot-page ot-loading">
        <div className="ot-spinner" />
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="ot-page ot-error">
        <p>{error}</p>
        <button onClick={() => navigate(isVendor ? '/profile' : '/')}>
          <Home size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {isVendor ? 'Go to Vendor Dashboard' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const rawStatus = (order?.status || 'Pending');
  const normalizedStatus = rawStatus.toLowerCase();
  const activeStepIndex = getStepIndex(normalizedStatus);

  const isCompleted = normalizedStatus === 'completed';
  const isCancelled = normalizedStatus === 'cancelled';
  const isPreparing = normalizedStatus === 'preparing';
  const isPaid = normalizedStatus === 'paid';

  // Estimate pickup time (15 mins from order creation or now)
  const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
  const pickupTime = new Date(orderDate.getTime() + 15 * 60 * 1000);
  const pickupStr = pickupTime.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = () => {
    if (isCancelled) return '❌ Order Cancelled';
    if (isCompleted) return '✅ Ready for Pickup!';
    if (isPreparing) return '🍳 Kitchen is Cooking!';
    if (isPaid) return '💳 Payment Confirmed — Kitchen Notified';
    return '⏳ Order Placed — Pending Confirmation';
  };

  const getTimeText = () => {
    if (isCancelled) return 'Cancelled';
    if (isCompleted) return 'Ready Now! 🎉';
    return pickupStr;
  };

  const totalAmount = parseFloat(order?.total_amount) || 0;

  return (
    <div className="ot-page">
      <header className="ot-header">
        <button className="ot-back-btn" onClick={() => navigate('/')} aria-label="Back to home">
          <ArrowLeft size={22} />
        </button>
        <h1>Order Tracking</h1>
      </header>

      <div className="ot-estimated">
        <p className="ot-estimated-label">ESTIMATED PICKUP</p>
        <p className="ot-time">{getTimeText()}</p>
        <div className={`ot-status-pill ${isCancelled ? 'cancelled' : ''}`}>
          {getStatusBadge()}
        </div>
      </div>

      <div className="ot-bag-wrapper">
        <div className={`ot-bag-glow ${isCompleted ? 'ready' : isCancelled ? 'cancelled' : ''}`}>
          <span className="ot-bag-emoji">{isCancelled ? '❌' : '🛍️'}</span>
        </div>
      </div>

      <div className="ot-steps">
        {STEPS.map((step, index) => {
          const isPast = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const Icon = isCancelled && isActive ? XCircle : step.icon;

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
                <p className={`ot-step-label ${isActive ? 'active' : ''}`}>
                  {isCancelled && isActive ? 'Order Cancelled' : step.label}
                </p>
                {isActive && (
                  <p className="ot-step-desc">
                    {isCancelled ? 'This order was cancelled by the vendor.' : step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ot-receipt">
        <div className="ot-receipt-header">
          <span className="ot-order-id">ORDER #{order?.id || resolvedOrderId}</span>
          <span className="ot-receipt-tag">Receipt</span>
        </div>
        <div className="ot-receipt-total">
          <span>Total Paid</span>
          <span className="ot-amount">₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {isCompleted ? (
        <button className="ot-action-btn" onClick={() => navigate('/')}>
          Enjoy your meal! Back to Home
        </button>
      ) : (
        <div className="ot-refresh-hint">
          <Clock size={13} />
          <span>Auto-updating live every 12 seconds</span>
        </div>
      )}
    </div>
  );
}

export default OrderTracking;
