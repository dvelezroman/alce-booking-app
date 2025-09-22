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
    
    // Test subscription check endpoint first
    console.log('5. Testing subscription check endpoint...');
    try {
      const checkResponse = await fetch(`${apiUrl}/has-subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Subscription check response status:', checkResponse.status);
      const checkResponseText = await checkResponse.text();
      console.log('Subscription check response body:', checkResponseText);
      
      if (checkResponse.ok) {
        console.log('✅ Subscription check endpoint is working correctly');
        try {
          const checkResponseJson = JSON.parse(checkResponseText);
          console.log('✅ Subscription check response structure is valid:', {
            hasActiveSubscription: 'hasActiveSubscription' in checkResponseJson,
            hasSubscriptionCount: 'subscriptionCount' in checkResponseJson,
            hasUserId: 'userId' in checkResponseJson,
            hasActiveSubscriptionValue: checkResponseJson.hasActiveSubscription
          });
        } catch (parseError) {
          console.warn('⚠️ Subscription check response is not valid JSON:', parseError.message);
        }
      } else {
        console.error('❌ Subscription check endpoint returned error:', checkResponse.status, checkResponseText);
      }
    } catch (error) {
      console.error('❌ Subscription check API test error:', error.message);
    }

    // Test API connectivity with actual subscription endpoint
    console.log('6. Testing subscription endpoint...');
    try {
      const testSubscription = {
        subscription: {
          endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key'
          }
        }
      };
      
      console.log('Sending test request:', testSubscription);
      
      const testResponse = await fetch(`${apiUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testSubscription)
      });
      
      console.log('API response status:', testResponse.status);
      console.log('API response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      const responseText = await testResponse.text();
      console.log('API response body:', responseText);
      
      if (testResponse.ok) {
        console.log('✅ API endpoint is working correctly');
        try {
          const responseJson = JSON.parse(responseText);
          console.log('✅ Response structure is valid:', {
            hasId: 'id' in responseJson,
            hasUserId: 'userId' in responseJson,
            hasEndpoint: 'endpoint' in responseJson,
            hasIsActive: 'isActive' in responseJson
          });
        } catch (parseError) {
          console.warn('⚠️ Response is not valid JSON:', parseError.message);
        }
      } else {
        console.error('❌ API endpoint returned error:', testResponse.status, responseText);
      }
    } catch (error) {
      console.error('❌ API test error:', error.message);
    }
    
    console.log('5. Ready to test subscription...');
    console.log('Run the subscription test in the app or call subscribeToPush() method');
    
  } catch (error) {
    console.error('❌ Service worker error:', error);
  }
}

// Test function to manually test subscription
async function testPushSubscription() {
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    console.warn('Test function only works in development mode');
    return;
  }
  
  console.log('=== Manual Push Subscription Test ===');
  
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error('❌ No access token found. Please log in first.');
    return;
  }
  
  try {
    // Get a real push subscription
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BOVYepzMrdf4xm-otXeH_iTT-8A6-ZxbSCA_sk6GJoPJn5sjlNFZejP5AQtCMyMzAsBn-ToWKcTXhclm_sSTgZA'
    });
    
    console.log('✅ Push subscription created:', subscription.endpoint);
    
    // Convert to our format
    const pushSubscription = {
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        }
      }
    };
    
    console.log('Sending subscription to server...');
    
    const response = await fetch('https://alce-api.porto-rockcity-app.com/v0/push-notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pushSubscription)
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Subscription saved successfully!');
    } else {
      console.error('❌ Failed to save subscription');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the debug function
debugPushSubscription();

// Make test function available globally
window.testPushSubscription = testPushSubscription;
