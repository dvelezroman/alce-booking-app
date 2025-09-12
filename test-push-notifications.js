#!/usr/bin/env node

/**
 * Test script for push notifications
 * This script simulates the complete flow:
 * 1. User subscribes to push notifications
 * 2. A notification is created in the database
 * 3. Push notification is sent to the user
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3300/v0';
const TEST_USER_ID = 1; // Replace with a real user ID from your database

// Test data
const testNotification = {
  title: 'Test Notification',
  body: 'This is a test notification to verify push notifications are working!',
  data: {
    url: '/dashboard/notifications',
    notificationId: Date.now()
  },
  requireInteraction: true
};

async function testPushNotifications() {
  console.log('🚀 Starting Push Notification Test...\n');

  try {
    // Step 1: Test if user has push subscription
    console.log('1️⃣ Checking if user has push subscription...');
    try {
      const subscriptionResponse = await axios.get(
        `${API_BASE_URL}/api/push-notifications/subscriptions/${TEST_USER_ID}`,
        {
          headers: {
            'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
          }
        }
      );
      console.log('✅ User has push subscription:', subscriptionResponse.data.length > 0);
    } catch (error) {
      console.log('❌ Error checking subscription:', error.response?.data || error.message);
    }

    // Step 2: Send test push notification
    console.log('\n2️⃣ Sending test push notification...');
    try {
      const pushResponse = await axios.post(
        `${API_BASE_URL}/api/push-notifications/send`,
        {
          userId: TEST_USER_ID,
          ...testNotification
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
          }
        }
      );
      console.log('✅ Push notification sent successfully:', pushResponse.data);
    } catch (error) {
      console.log('❌ Error sending push notification:', error.response?.data || error.message);
    }

    // Step 3: Test unread notification alert
    console.log('\n3️⃣ Testing unread notification alert...');
    try {
      const alertResponse = await axios.post(
        `${API_BASE_URL}/api/push-notifications/unread-alert/${TEST_USER_ID}`,
        {},
        {
          params: { count: 3 },
          headers: {
            'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
          }
        }
      );
      console.log('✅ Unread notification alert sent:', alertResponse.data);
    } catch (error) {
      console.log('❌ Error sending unread alert:', error.response?.data || error.message);
    }

    console.log('\n🎉 Test completed! Check your PWA for notifications.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log(`
📋 PUSH NOTIFICATION TEST SCRIPT
================================

Before running this test:

1. Make sure your NestJS API is running on http://localhost:3300
2. Replace YOUR_JWT_TOKEN_HERE with a real JWT token
3. Replace TEST_USER_ID with a real user ID from your database
4. Make sure the user has subscribed to push notifications in the PWA

To run the test:
node test-push-notifications.js

Expected flow:
1. User installs PWA and enables notifications
2. User subscribes to push notifications (subscription saved to database)
3. This script sends a push notification
4. User receives notification and can click to open PWA

`);

// Run the test
if (require.main === module) {
  testPushNotifications();
}

module.exports = { testPushNotifications };
