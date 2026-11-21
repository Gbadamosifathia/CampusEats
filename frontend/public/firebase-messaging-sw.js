// Firebase Cloud Messaging Service Worker for CampusEats
// Handles background push notifications when screen is locked or browser is closed
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBCm49CrJLCJPkHOjJ4ezovR6iV6hvAwXg",
  authDomain: "campuseats-cf7d.firebaseapp.com",
  projectId: "campuseats-cf7d",
  storageBucket: "campuseats-cf7d.firebasestorage.app",
  messagingSenderId: "505527404291",
  appId: "1:505527404291:web:d134796900612cc1e30b36",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'New Order on CampusEats! 🛍️';
  const body = payload.notification?.body || payload.data?.body || 'You have received a new order.';
  
  const options = {
    body,
    icon: '/src/assets/logo.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open Dashboard' }
    ]
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = '/profile';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

