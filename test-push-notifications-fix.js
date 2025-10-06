#!/usr/bin/env node

/**
 * Test script to verify push notification fix
 * This script helps test if push notifications are received when the app is closed
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://alce-api.porto-rockcity-app.com/v0';
const TEST_USER_ID = 618; // Replace with a real user ID from your database

// Test data
const testNotification = {
  title: 'Test Push Notification Fix',
  body: 'This notification should appear even when the app is closed!',
  data: {
    url: '/dashboard/notifications',
    notificationId: Date.now()
  },
  requireInteraction: true
};

async function testPushNotificationFix() {
  console.log('🚀 Testing Push Notification Fix...\n');

  try {
    // Step 1: Check if user has push subscription
    console.log('1️⃣ Checking if user has push subscription...');
    try {
      const subscriptionResponse = await axios.get(
        `${API_BASE_URL}/push-notifications/has-subscription`,
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc05ld1VzZXIiOmZhbHNlLCJpZCI6MSwiZW1haWwiOiJkdmVsZXpyb21hbkBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJBZG1pbiIsImxhc3ROYW1lIjoiRGFyaW8iLCJiaXJ0aGRheSI6IjE5ODItMDctMjNUMDA6MDA6MDAuMDAwWiIsInJvbGUiOiJBRE1JTiIsInJlZ2lzdGVyIjp0cnVlLCJzdGF0dXMiOiJBQ1RJVkUiLCJzdHVkZW50IjpudWxsLCJpbnN0cnVjdG9yIjpudWxsLCJlbWFpbEFkZHJlc3MiOiJkdmVsZXpyb21hbkBnbWFpbC5jb20iLCJjaXR5IjoiUG9ydG92aWVqbyIsImNvdW50cnkiOiJFQyIsImNvbnRhY3QiOiIrNTkzOTk1NzEwNTU2IiwiaWF0IjoxNzU5Nzg0MDcxLCJleHAiOjE3NTk4MTI4NzF9.RCsCzYZv8Wiz8ZVK0VSN90jVA3Xp5yBoMhyvbRvKwDQ' // Replace with real token
          }
        }
      );
      console.log('✅ User has push subscription:', subscriptionResponse.data.hasActiveSubscription);
    } catch (error) {
      console.log('❌ Error checking subscription:', error.response?.data || error.message);
    }

    // Step 2: Send test push notification
    console.log('\n2️⃣ Sending test push notification...');
    try {
      const pushResponse = await axios.post(
        `${API_BASE_URL}/push-notifications/send`,
        {
          userId: TEST_USER_ID,
          ...testNotification
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc05ld1VzZXIiOmZhbHNlLCJpZCI6MSwiZW1haWwiOiJkdmVsZXpyb21hbkBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJBZG1pbiIsImxhc3ROYW1lIjoiRGFyaW8iLCJiaXJ0aGRheSI6IjE5ODItMDctMjNUMDA6MDA6MDAuMDAwWiIsInJvbGUiOiJBRE1JTiIsInJlZ2lzdGVyIjp0cnVlLCJzdGF0dXMiOiJBQ1RJVkUiLCJzdHVkZW50IjpudWxsLCJpbnN0cnVjdG9yIjpudWxsLCJlbWFpbEFkZHJlc3MiOiJkdmVsZXpyb21hbkBnbWFpbC5jb20iLCJjaXR5IjoiUG9ydG92aWVqbyIsImNvdW50cnkiOiJFQyIsImNvbnRhY3QiOiIrNTkzOTk1NzEwNTU2IiwiaWF0IjoxNzU5Nzg0MDcxLCJleHAiOjE3NTk4MTI4NzF9.RCsCzYZv8Wiz8ZVK0VSN90jVA3Xp5yBoMhyvbRvKwDQ' // Replace with real token
          }
        }
      );
      console.log('✅ Push notification sent successfully:', pushResponse.data);
    } catch (error) {
      console.log('❌ Error sending push notification:', error.response?.data || error.message);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Close your PWA completely (not just minimize)');
    console.log('2. Wait for the push notification to arrive');
    console.log('3. The notification should appear even with the app closed');
    console.log('4. Click the notification to open the app');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log(`
📋 PUSH NOTIFICATION FIX TEST SCRIPT
====================================

This script tests the fix for push notifications not being received when the app is closed.

Before running this test:

1. Make sure your backend API is running
2. Replace YOUR_JWT_TOKEN_HERE with a real JWT token
3. Replace TEST_USER_ID with a real user ID from your database
4. Make sure the user has subscribed to push notifications in the PWA
5. Build and deploy your app with the new service worker configuration

To run the test:
node test-push-notifications-fix.js

Expected behavior after the fix:
1. User installs PWA and enables notifications
2. User subscribes to push notifications (subscription saved to database)
3. This script sends a push notification
4. User receives notification EVEN WHEN THE APP IS CLOSED
5. User can click notification to open PWA

The fix includes:
- Custom service worker registration for push notifications
- Proper service worker scope and registration
- Enhanced push event handling
- Better error handling and fallbacks

`);

// Run the test
if (require.main === module) {
  testPushNotificationFix();
}

module.exports = { testPushNotificationFix };
