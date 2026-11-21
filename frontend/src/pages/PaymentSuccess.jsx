import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader, ArrowRight, Home, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { clearCart } = useCart();

  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
  const [message, setMessage] = useState('Verifying your payment with Paystack...');
  const [countdown, setCountdown] = useState(3);
  const [targetOrderId, setTargetOrderId] = useState(null);

  const verificationAttemptedRef = useRef(false);

  // Extract order ID from reference string (e.g. "order_15_1730000000.0")
  const extractOrderIdFromReference = (ref) => {
    if (!ref) return null;
    const parts = ref.split('_');
    if (parts.length >= 2 && !isNaN(parseInt(parts[1], 10))) {
      return parts[1];
    }
    return null;
  };

  useEffect(() => {
    // Clear cart immediately since user completed payment on Paystack
    clearCart();

    const storedOrderId = localStorage.getItem('last_order_id');
    const orderIdFromRef = extractOrderIdFromReference(reference);
    const resolvedOrderId = orderIdFromRef || storedOrderId;
    if (resolvedOrderId) {
      setTargetOrderId(resolvedOrderId);
    }

    if (!reference) {
      if (resolvedOrderId) {
        setStatus('success');
        setMessage('Payment processed! Redirecting to your order tracking...');
      } else {
        setStatus('failed');
        setMessage('No payment reference found. Please check your order history.');
      }
      return;
    }

    if (verificationAttemptedRef.current) return;
    verificationAttemptedRef.current = true;

    const verifyTransaction = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment_verify/${reference}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          const finalOrderId = data.order_id || resolvedOrderId;
          if (finalOrderId) {
            setTargetOrderId(finalOrderId);
            localStorage.setItem('last_order_id', String(finalOrderId));
          }
          setStatus('success');
          setMessage('Payment verified successfully! Your order has been placed with the kitchen.');
        } else {
          // If backend returns 400, verify if order is already Paid (e.g., verified by webhook)
          if (resolvedOrderId && token) {
            try {
              const checkOrderRes = await fetch(`${API_URL}/api/order/${resolvedOrderId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (checkOrderRes.ok) {
                const orderData = await checkOrderRes.json();
                if (orderData.status === 'Paid' || orderData.status === 'Preparing' || orderData.status === 'Completed') {
                  setStatus('success');
                  setMessage('Payment confirmed! Your order has been received by the kitchen.');
                  return;
                }
              }
            } catch (e) {
              console.warn('Fallback order status check failed:', e);
            }
          }

          setStatus('failed');
          setMessage(data.message || data.error || 'Payment verification failed. If your account was debited, your order will update shortly.');
        }
      } catch (err) {
        console.error('Error during payment verification:', err);
        // If network failed but we have orderId, allow navigating to tracking
        if (resolvedOrderId) {
          setStatus('success');
          setMessage('Payment submitted! Checking kitchen status...');
        } else {
          setStatus('failed');
          setMessage('Unable to verify payment due to a network error.');
        }
      }
    };

    if (token) {
      verifyTransaction();
    }
  }, [reference, token]);

  // Countdown timer when status becomes 'success'
  useEffect(() => {
    if (status !== 'success') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (targetOrderId) {
            navigate(`/order-tracking/${targetOrderId}`);
          } else {
            navigate('/order-tracking');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, targetOrderId, navigate]);

  const handleManualNavigate = () => {
    if (targetOrderId) {
      navigate(`/order-tracking/${targetOrderId}`);
    } else {
      navigate('/order-tracking');
    }
  };

  return (
    <div className="ps-container">
      <div className="ps-card">
        {status === 'verifying' && (
          <div className="ps-state verifying">
            <div className="ps-spinner-wrapper">
              <Loader className="ps-spinner" size={54} color="#f05a28" />
            </div>
            <h2>Verifying Payment</h2>
            <p className="ps-message">{message}</p>
            {reference && <p className="ps-reference">Ref: {reference}</p>}
          </div>
        )}

        {status === 'success' && (
          <div className="ps-state success">
            <div className="ps-icon-wrapper success-icon">
              <CheckCircle2 size={64} color="#2e7d32" />
            </div>
            <h2>Order Placed! 🎉</h2>
            <p className="ps-message">{message}</p>
            {targetOrderId && (
              <div className="ps-order-badge">
                <span>Order #{targetOrderId}</span>
              </div>
            )}
            <p className="ps-redirect-hint">
              Redirecting to order tracking in <strong>{countdown}s</strong>...
            </p>
            <button className="ps-btn ps-primary-btn" onClick={handleManualNavigate}>
              Track Order Now <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="ps-state failed">
            <div className="ps-icon-wrapper failed-icon">
              <AlertCircle size={64} color="#d32f2f" />
            </div>
            <h2>Verification Issue</h2>
            <p className="ps-message">{message}</p>
            {reference && <p className="ps-reference">Ref: {reference}</p>}
            <div className="ps-actions">
              {targetOrderId ? (
                <button className="ps-btn ps-primary-btn" onClick={handleManualNavigate}>
                  Check Order Status <ArrowRight size={18} />
                </button>
              ) : (
                <button className="ps-btn ps-primary-btn" onClick={() => window.location.reload()}>
                  <RefreshCw size={18} /> Retry Verification
                </button>
              )}
              <button className="ps-btn ps-secondary-btn" onClick={() => navigate('/')}>
                <Home size={18} /> Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;

