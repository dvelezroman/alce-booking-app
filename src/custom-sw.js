// Custom service worker for push notifications
// This file will be merged with the Angular service worker

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  console.log('Event data type:', typeof event.data);
  console.log('Event data methods:', Object.getOwnPropertyNames(event.data));

  let notificationData = {
    title: 'Nueva notificación',
    body: 'Tienes una nueva notificación',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    tag: 'notification',
    data: {
      url: '/dashboard/notifications',
      timestamp: Date.now()
    },
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver notificaciones',
        icon: '/assets/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/assets/icons/icon-72x72.png'
      }
    ]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushText = event.data.text();
      console.log('Push data received as text:', pushText);
      
      if (pushText) {
        try {
          const pushData = JSON.parse(pushText);
          console.log('Successfully parsed push data:', pushData);
          
          if (pushData && typeof pushData === 'object') {
            notificationData = {
              ...notificationData,
              title: pushData.title || notificationData.title,
              body: pushData.body || notificationData.body,
              icon: pushData.icon || notificationData.icon,
              badge: pushData.badge || notificationData.badge,
              tag: pushData.tag || notificationData.tag,
              data: pushData.data || notificationData.data,
              requireInteraction: pushData.requireInteraction !== undefined ? pushData.requireInteraction : notificationData.requireInteraction,
              silent: pushData.silent !== undefined ? pushData.silent : notificationData.silent,
              actions: pushData.actions || notificationData.actions
            };
          }
        } catch (parseError) {
          console.error('Error parsing push data as JSON:', parseError);
          notificationData.body = pushText;
          notificationData.title = 'Nueva notificación';
        }
      }
    } catch (error) {
      console.error('Error processing push data:', error);
    }
  }

  console.log('Final notification data:', notificationData);

  // Show notification and update unread count
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(notificationData.title, notificationData),
      updateUnreadNotificationCount()
    ])
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    // Decrease unread count when notification is dismissed
    event.waitUntil(updateUnreadNotificationCount(-1));
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/dashboard/notifications';
  
  event.waitUntil(
    Promise.all([
      // Decrease unread count when notification is clicked
      updateUnreadNotificationCount(-1),
      // Navigate to the app
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    ])
  );
});

// Listen for notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // You can track notification dismissal here
  // This is useful for analytics
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync notification data when back online
      syncNotifications()
    );
  }
});

// Function to sync notifications when back online
async function syncNotifications() {
  try {
    // This would typically make API calls to sync notification data
    console.log('Syncing notifications...');
    
    // You can implement notification sync logic here
    // For example, marking notifications as read, fetching new ones, etc.
    
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  
  event.waitUntil(
    // Re-subscribe to push notifications
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription.options.applicationServerKey
    }).then((newSubscription) => {
      // Send new subscription to server
      return fetch('/api/push-notifications/resubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldSubscription: event.oldSubscription,
          newSubscription: newSubscription
        })
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'UPDATE_UNREAD_COUNT') {
    updateUnreadNotificationCount(event.data.count);
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  
  event.waitUntil(
    clients.claim()
  );
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  
  event.waitUntil(
    self.skipWaiting()
  );
});

// Function to update unread notification count
async function updateUnreadNotificationCount(increment = 1) {
  try {
    // Get current unread count from storage
    const result = await self.registration.getNotifications();
    const currentCount = result.length;
    
    // Calculate new count
    const newCount = currentCount + increment;
    
    // Store the count in IndexedDB or send message to main app
    await storeUnreadCount(newCount);
    
    // Send message to all clients (main app windows)
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'UNREAD_COUNT_UPDATE',
        count: newCount
      });
    });
    
    console.log(`Updated unread notification count to: ${newCount}`);
  } catch (error) {
    console.error('Error updating unread notification count:', error);
  }
}

// Function to store unread count
async function storeUnreadCount(count) {
  try {
    // Store in IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['unreadCount'], 'readwrite');
    const store = transaction.objectStore('unreadCount');
    await store.put({ id: 1, count: count, timestamp: Date.now() });
  } catch (error) {
    console.error('Error storing unread count:', error);
  }
}

// Function to get unread count
async function getUnreadCount() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['unreadCount'], 'readonly');
    const store = transaction.objectStore('unreadCount');
    const result = await store.get(1);
    return result ? result.count : 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('unreadCount')) {
        db.createObjectStore('unreadCount', { keyPath: 'id' });
      }
    };
  });
}
