// Service Worker for CampusEats Web Push & Android Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push notification events from push servers
self.addEventListener('push', (event) => {
  let data = { title: 'New Notification', body: 'You have a new update from CampusEats.' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'You have a new order or update.',
    icon: '/src/assets/logo.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Open CampusEats' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CampusEats', options)
  );
});

// When user taps on the notification in Android notification drawer
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Or open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

