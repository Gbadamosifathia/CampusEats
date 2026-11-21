import { API_URL } from '../config';
import { getFirebaseMessaging, VAPID_KEY } from '../firebase';

let messagingPromise = null;

const getMessagingSafe = () => {
  if (!messagingPromise && typeof window !== 'undefined') {
    messagingPromise = getFirebaseMessaging().catch(err => {
      console.debug('Firebase messaging not available:', err);
      return null;
    });
  }
  return messagingPromise;
};

/**
 * Check if the user is on an iOS device (iPhone/iPad)
 */
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Check if app is installed to Home Screen (PWA Standalone Mode)
 */
export const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
};

/**
 * Register the Service Worker (required for Android Chrome & Firebase Cloud Messaging)
 */
export const initServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Register firebase-messaging-sw.js which handles FCM background messages
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
      return reg;
    } catch (err) {
      console.debug('ServiceWorker registration error, trying fallback:', err);
      try {
        const fallbackReg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        return fallbackReg;
      } catch (fErr) {
        console.debug('Fallback SW error:', fErr);
        return null;
      }
    }
  }
  return null;
};

// Auto-register service worker on browser load
if (typeof window !== 'undefined') {
  initServiceWorker();
}

/**
 * Obtain a genuine Firebase Cloud Messaging (FCM) device registration token.
 * Uses the VAPID key to generate an official FCM web push token.
 */
export const getOrCreateDeviceToken = async () => {
  // First check if we already have an FCM token stored
  const isRealFcm = localStorage.getItem('ce_is_real_fcm') === 'true';
  let token = localStorage.getItem('ce_device_token');
  if (token && isRealFcm) {
    return token;
  }

  // Try to acquire a real FCM token via Firebase Web SDK
  try {
    const messaging = await getMessagingSafe();
    if (messaging && 'serviceWorker' in navigator) {
      const swReg = await navigator.serviceWorker.ready;
      const fcmToken = await messaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });

      if (fcmToken) {
        localStorage.setItem('ce_device_token', fcmToken);
        localStorage.setItem('ce_is_real_fcm', 'true');
        return fcmToken;
      }
    }
  } catch (fcmErr) {
    console.debug('FCM token acquisition error, using fallback identifier:', fcmErr);
  }

  // Fallback identifier if FCM is blocked or unavailable
  if (!token) {
    const array = new Uint8Array(24);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
      token = 'fcm_web_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      token = 'fcm_web_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    localStorage.setItem('ce_device_token', token);
  }

  return token;
};

/**
 * Register the vendor device token with the backend API /api/savetoken/
 */
export const registerDeviceTokenWithBackend = async (authToken, explicitToken = null) => {
  if (!authToken) {
    console.warn('Cannot register device token: No auth token provided');
    return { success: false, error: 'Unauthorized' };
  }

  const tokenToRegister = explicitToken || await getOrCreateDeviceToken();

  try {
    const res = await fetch(`${API_URL}/api/savetoken/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ token: tokenToRegister })
    });

    if (res.ok) {
      localStorage.setItem('ce_notifications_registered', 'true');
      return { success: true, token: tokenToRegister };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to save token' };
    }
  } catch (error) {
    console.error('Network error registering device token:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Request browser notification permission and register real FCM device token with backend.
 */
export const requestAndRegisterNotifications = async (authToken) => {
  if (isIOS() && !isStandalone()) {
    return {
      success: false,
      isIOSPrompt: true,
      error: 'On iPhone, push notifications require adding CampusEats to your Home Screen: Tap the Share button (square with arrow up) at the bottom of Safari, then choose "Add to Home Screen".'
    };
  }

  if (!('Notification' in window)) {
    return { success: false, error: 'Browser does not support notifications' };
  }

  try {
    await initServiceWorker();

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const result = await registerDeviceTokenWithBackend(authToken);
      return { ...result, permission };
    } else {
      return { success: false, permission, error: 'Notification permission denied' };
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Listen for foreground Firebase Cloud Messaging push events
 */
export const setupForegroundFCMListener = async (onMessageReceived) => {
  try {
    const messaging = await getMessagingSafe();
    if (!messaging) return () => {};

    const unsubscribe = messaging.onMessage((payload) => {
      // Play audio chime and trigger vibration
      playNotificationChime();

      const title = payload.notification?.title || payload.data?.title || 'New Order on CampusEats! 🛍️';
      const body = payload.notification?.body || payload.data?.body || 'A customer has placed an order.';
      
      showBrowserNotification(title, { body, data: payload.data });

      if (onMessageReceived) {
        onMessageReceived(payload);
      }
    });

    return unsubscribe;
  } catch (err) {
    console.debug('Could not setup foreground FCM listener:', err);
    return () => {};
  }
};

/**
 * Show a browser notification (fully Android Chrome & Desktop compatible)
 */
export const showBrowserNotification = async (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions = {
    icon: '/src/assets/logo.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    ...options
  };

  // Android Chrome strictly requires ServiceWorkerRegistration.showNotification()
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    } catch (swErr) {
      console.debug('ServiceWorker showNotification fallback:', swErr);
    }
  }

  // Desktop browsers fallback
  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (e) {
    console.debug('Notification constructor fallback failed:', e);
    return false;
  }
};

/**
 * Play a pleasant audio chime and trigger Android hardware vibration for new orders
 */
export const playNotificationChime = () => {
  // Trigger physical phone vibration on Android
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {}
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: high pleasant chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: secondary harmonious bell
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.debug('Chime suppressed:', err);
  }
};
