// Custom service worker for push notifications
// This file will be merged with the Angular service worker

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

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
      // Try different methods to get the data
      let pushData = null;
      
      // Method 1: Try to get as JSON directly
      try {
        pushData = event.data.json();
        console.log('Push data as JSON:', pushData);
      } catch (jsonError) {
        console.log('Not JSON, trying as text...');
        
        // Method 2: Try to get as text and parse
        try {
          const pushText = event.data.text();
          console.log('Push data as text:', pushText);
          
          if (pushText) {
            // Try to parse as JSON
            try {
              pushData = JSON.parse(pushText);
              console.log('Parsed push data:', pushData);
            } catch (parseError) {
              // If not JSON, use as body
              console.log('Not JSON, using as body');
              notificationData.body = pushText;
              notificationData.title = 'Nueva notificación';
            }
          }
        } catch (textError) {
          console.error('Error getting push data as text:', textError);
        }
      }
      
      // If we successfully parsed JSON data, use it
      if (pushData && typeof pushData === 'object') {
        notificationData = {
          ...notificationData,
          ...pushData
        };
      }
      
    } catch (error) {
      console.error('Error processing push data:', error);
      console.log('Raw push data:', event.data);
    }
  }

  console.log('Final notification data:', notificationData);

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/dashboard/notifications';
  
  event.waitUntil(
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
