// Debug script to test push notification subscription
// Run this in the browser console to debug push notification issues
// Only works in development mode

async function debugPushSubscription() {
  // Check if we're in development mode
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    console.warn('Debug script only works in development mode');
    return;
  }
  
  console.log('=== Push Notification Debug ===');
  
  // Check if push notifications are supported
  console.log('1. Checking browser support...');
  console.log('Service Worker support:', 'serviceWorker' in navigator);
  console.log('Push Manager support:', 'PushManager' in window);
  console.log('Notification support:', 'Notification' in window);
  
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('❌ Push notifications not supported in this browser');
    return;
  }
  
  // Check current permission
  console.log('2. Checking notification permission...');
  console.log('Current permission:', Notification.permission);
  
  if (Notification.permission === 'denied') {
    console.error('❌ Notification permission denied');
    return;
  }
  
  // Check service worker registration
  console.log('3. Checking service worker...');
  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready:', registration);
    
    // Check existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    console.log('Existing subscription:', existingSubscription);
    
    if (existingSubscription) {
      console.log('✅ Already subscribed to push notifications');
      console.log('Endpoint:', existingSubscription.endpoint);
      return;
    }
    
    // Test API endpoint
    console.log('4. Testing API endpoint...');
    const apiUrl = 'https://alce-api.porto-rockcity-app.com/v0/push-notifications';
    console.log('API URL:', apiUrl);
    
    // Check if user is logged in (has access token)
    const accessToken = localStorage.getItem('accessToken');
    console.log('Access token exists:', !!accessToken);
    
    if (!accessToken) {
      console.error('❌ No access token found. User must be logged in.');
      return;
    }
    
    // Test API connectivity
    try {
      const testResponse = await fetch(`${apiUrl}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API test response status:', testResponse.status);
    } catch (error) {
      console.log('API test error (this might be expected):', error.message);
    }
    
    console.log('5. Ready to test subscription...');
    console.log('Run the subscription test in the app or call subscribeToPush() method');
    
  } catch (error) {
    console.error('❌ Service worker error:', error);
  }
}

// Run the debug function
debugPushSubscription();
