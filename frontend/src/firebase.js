export const firebaseConfig = {
  apiKey: "AIzaSyBCm49CrJLCJPkHOjJ4ezovR6iV6hvAwXg",
  authDomain: "campuseats-cf7d.firebaseapp.com",
  projectId: "campuseats-cf7d",
  storageBucket: "campuseats-cf7d.firebasestorage.app",
  messagingSenderId: "505527404291",
  appId: "1:505527404291:web:d134796900612cc1e30b36",
  measurementId: "G-S3KJJF2WRB"
};

export const VAPID_KEY = "BAIc6a2y1xpKWbXfum2YK_x4gXJKXGuHdP5qvYlU9AgAa-q7O9igJQp_WDU-NjS9u99mC34JEXIRch__BHjG1QE";

let firebaseApp = null;
let messagingInstance = null;

export const getFirebaseMessaging = async () => {
  if (typeof window === 'undefined') return null;

  // Check if window.firebase is loaded
  let attempts = 0;
  while ((!window.firebase || !window.firebase.messaging) && attempts < 15) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }

  if (!window.firebase || !window.firebase.messaging) {
    console.debug('Firebase CDN SDK not ready or unsupported');
    return null;
  }

  try {
    if (!window.firebase.apps || window.firebase.apps.length === 0) {
      firebaseApp = window.firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = window.firebase.app();
    }

    if (!messagingInstance) {
      if (typeof window.firebase.messaging.isSupported === 'function') {
        const supported = window.firebase.messaging.isSupported();
        if (supported) {
          messagingInstance = window.firebase.messaging();
        }
      } else {
        messagingInstance = window.firebase.messaging();
      }
    }
    return messagingInstance;
  } catch (err) {
    console.debug('Failed to get Firebase messaging instance:', err);
    return null;
  }
};
