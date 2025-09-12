#!/usr/bin/env node

/**
 * Complete Push Notification Flow Test
 * 
 * This script tests the complete flow:
 * 1. User subscribes to push notifications (PWA)
 * 2. Admin creates a notification via API
 * 3. Backend automatically sends push notifications to recipients
 * 4. Users receive push notifications and can click to open PWA
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3300/v0';
const TEST_ADMIN_ID = 1; // Admin user ID
const TEST_RECIPIENT_ID = 2; // Recipient user ID

// Test notification data
const testNotification = {
  from: TEST_ADMIN_ID,
  to: [TEST_RECIPIENT_ID],
  scope: 'INDIVIDUAL',
  title: 'Test Push Notification',
  message: {
    body: 'This is a test notification to verify the complete push notification flow!',
    action: 'view_notification'
  },
  notificationType: 'Announce',
  priority: 1,
  scheduledAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  metadata: {
    source: 'test_system',
    category: 'test_notification'
  },
  maxRetries: 3
};

async function testCompleteNotificationFlow() {
  console.log('🚀 Starting Complete Push Notification Flow Test...\n');

  try {
    // Step 1: Check if recipient has push subscription
    console.log('1️⃣ Checking if recipient has push subscription...');
    try {
      const subscriptionResponse = await axios.get(
        `${API_BASE_URL}/api/push-notifications/subscriptions/${TEST_RECIPIENT_ID}`,
        {
          headers: {
            'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
          }
        }
      );
      const hasSubscription = subscriptionResponse.data.length > 0;
      console.log(`✅ Recipient has push subscription: ${hasSubscription}`);
      
      if (!hasSubscription) {
        console.log('⚠️  Recipient needs to subscribe to push notifications in the PWA first!');
        console.log('   Steps:');
        console.log('   1. Open PWA: http://localhost:3000');
        console.log('   2. Install as PWA');
        console.log('   3. Enable notifications');
        console.log('   4. Run this test again\n');
        return;
      }
    } catch (error) {
      console.log('❌ Error checking subscription:', error.response?.data || error.message);
      return;
    }

    // Step 2: Create notification (this should trigger push notifications)
    console.log('\n2️⃣ Creating notification (this should trigger push notifications)...');
    try {
      const notificationResponse = await axios.post(
        `${API_BASE_URL}/notifications`, // Your existing notification endpoint
        testNotification,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
          }
        }
      );
      
      console.log('✅ Notification created successfully:', {
        id: notificationResponse.data.id,
        title: notificationResponse.data.title,
        recipients: notificationResponse.data.to
      });
      
      console.log('📱 Push notifications should have been sent automatically!');
      console.log('   Check the recipient\'s device for push notifications.');
      
    } catch (error) {
      console.log('❌ Error creating notification:', error.response?.data || error.message);
      
      // If notification creation fails, try direct push notification test
      console.log('\n🔄 Falling back to direct push notification test...');
      await testDirectPushNotification();
    }

    // Step 3: Verify notification was created
    console.log('\n3️⃣ Verifying notification was created...');
    try {
      const notificationsResponse = await axios.get(
        `${API_BASE_URL}/notifications?userId=${TEST_RECIPIENT_ID}`,
        {
          headers: {
            'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
          }
        }
      );
      
      const notifications = notificationsResponse.data;
      const latestNotification = notifications[0];
      
      console.log('✅ Latest notification:', {
        id: latestNotification.id,
        title: latestNotification.title,
        status: latestNotification.status,
        createdAt: latestNotification.createdAt
      });
      
    } catch (error) {
      console.log('❌ Error fetching notifications:', error.response?.data || error.message);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📋 Expected Flow:');
    console.log('1. ✅ Notification created in database');
    console.log('2. ✅ Push notification sent to recipient');
    console.log('3. ✅ Recipient receives push notification');
    console.log('4. ✅ Recipient can click notification to open PWA');
    console.log('5. ✅ PWA opens to notifications page');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testDirectPushNotification() {
  console.log('\n🔧 Testing direct push notification...');
  
  try {
    const pushResponse = await axios.post(
      `${API_BASE_URL}/api/push-notifications/send`,
      {
        userId: TEST_RECIPIENT_ID,
        title: 'Direct Test Notification',
        body: 'This is a direct push notification test!',
        data: {
          url: '/dashboard/notifications',
          notificationId: 'direct-test'
        },
        requireInteraction: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with real token
        }
      }
    );
    
    console.log('✅ Direct push notification sent:', pushResponse.data);
    
  } catch (error) {
    console.log('❌ Error sending direct push notification:', error.response?.data || error.message);
  }
}

// Instructions
console.log(`
📋 COMPLETE PUSH NOTIFICATION FLOW TEST
=======================================

This test verifies the complete flow:
1. User subscribes to push notifications (PWA)
2. Admin creates notification via API
3. Backend automatically sends push notifications
4. Users receive push notifications and can click to open PWA

Prerequisites:
1. NestJS API running on http://localhost:3300
2. PWA built and served on http://localhost:3000
3. User has subscribed to push notifications in PWA
4. Valid JWT token for API calls

Configuration:
- API URL: ${API_BASE_URL}
- Admin ID: ${TEST_ADMIN_ID}
- Recipient ID: ${TEST_RECIPIENT_ID}

Before running:
1. Replace YOUR_JWT_TOKEN_HERE with a real JWT token
2. Update TEST_ADMIN_ID and TEST_RECIPIENT_ID with real user IDs
3. Make sure the recipient has subscribed to push notifications

To run: node test-complete-notification-flow.js

`);

// Run the test
if (require.main === module) {
  testCompleteNotificationFlow();
}

module.exports = { testCompleteNotificationFlow };
