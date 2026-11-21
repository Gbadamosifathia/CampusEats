import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import {
  playNotificationChime,
  showBrowserNotification,
  registerDeviceTokenWithBackend,
  setupForegroundFCMListener,
} from '../utils/notifications';
import './VendorNotificationListener.css';

export default function VendorNotificationListener() {
  const { token, isVendor, vendorId } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const initialLoadRef = useRef(false);

  // Sync token with backend once when vendor is authenticated
  useEffect(() => {
    if (isVendor && token && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerDeviceTokenWithBackend(token);
    }
  }, [isVendor, token]);

  // Connect live foreground FCM push message listener
  useEffect(() => {
    if (!isVendor) return;
    let unsub = null;
    setupForegroundFCMListener((payload) => {
      const orderId = payload.data?.order_id;
      setToast({
        id: orderId || 'New',
        total: payload.data?.total || '0',
        status: 'New'
      });
    }).then(cleanup => {
      unsub = cleanup;
    });

    return () => {
      if (unsub) unsub();
    };
  }, [isVendor]);

  useEffect(() => {
    if (!isVendor || !token || !vendorId) return;

    let timer = null;
    let isCancelled = false;

    const checkVendorOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/vendor/${vendorId}/orders/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok && !isCancelled) {
          const orders = await res.json();

          if (!initialLoadRef.current) {
            // Seed known order IDs on startup
            knownOrderIdsRef.current = new Set(orders.map(o => o.id));
            initialLoadRef.current = true;
          } else {
            // Check for new orders
            const newOrders = orders.filter(o => !knownOrderIdsRef.current.has(o.id));
            if (newOrders.length > 0) {
              const latest = newOrders[0];
              // Add to known set
              newOrders.forEach(o => knownOrderIdsRef.current.add(o.id));

              // Play audio chime
              playNotificationChime();

              // Trigger system notification
              showBrowserNotification(`New Order #${latest.id}! 🛍️`, {
                body: `Total: ₦${parseFloat(latest.total_amount).toLocaleString()} - Status: ${latest.status}`,
                tag: `vendor-order-${latest.id}`
              });

              // Show floating in-app banner
              setToast({
                id: latest.id,
                total: latest.total_amount,
                status: latest.status
              });
            }
          }
        }
      } catch (err) {
        console.debug('Background order check:', err);
      }

      if (!isCancelled) {
        timer = setTimeout(checkVendorOrders, 12000);
      }
    };

    checkVendorOrders();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isVendor, token, vendorId]);

  if (!toast) return null;

  return (
    <div className="vendor-order-toast">
      <div className="toast-icon">
        <Bell size={20} />
      </div>
      <div className="toast-content" onClick={() => { setToast(null); navigate('/profile'); }}>
        <p className="toast-title">New Order #{toast.id} Received! 🛍️</p>
        <p className="toast-desc">Total: ₦{parseFloat(toast.total).toLocaleString()} • Tap to open dashboard</p>
      </div>
      <button className="toast-view-btn" onClick={() => { setToast(null); navigate('/profile'); }}>
        <ExternalLink size={14} /> View
      </button>
      <button className="toast-close-btn" onClick={() => setToast(null)} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}

