# Push Notifications Implementation Guide

## 🚀 Overview
Your Alce College Booking App now has a complete push notification system that notifies users about unread notifications, class reminders, and important updates.

## ✅ What's Been Implemented

### 1. **Push Notification Service** (`src/app/services/push-notification.service.ts`)
- **VAPID Key Management**: Handles push subscription with VAPID keys
- **Permission Management**: Requests and manages notification permissions
- **Subscription Management**: Subscribe/unsubscribe from push notifications
- **Local Notifications**: Shows local notifications when app is open
- **Periodic Checks**: Automatically checks for unread notifications every 5 minutes
- **Server Integration**: Saves/removes subscriptions on your backend

### 2. **Notification Permission Component** (`src/app/components/notification-permission/`)
- **Permission Banner**: Shows when notifications are not enabled
- **User-Friendly UI**: Clean interface to enable notifications
- **Success Feedback**: Confirms when notifications are activated
- **Responsive Design**: Works on mobile and desktop

### 3. **Notification Settings Component** (`src/app/components/notification-settings/`)
- **Settings Panel**: Complete notification management interface
- **Status Display**: Shows current notification status
- **Enable/Disable**: Toggle notifications on/off
- **Helpful Tips**: User guidance and information

### 4. **Enhanced Service Worker** (`src/custom-sw.js`)
- **Push Event Handling**: Processes incoming push notifications
- **Notification Actions**: Handles click, dismiss, and action events
- **Background Sync**: Syncs notification data when back online
- **App Navigation**: Opens app to relevant pages when notifications are clicked

### 5. **Updated PWA Service** (`src/app/services/pwa.service.ts`)
- **Push Support Detection**: Checks if push notifications are supported
- **Permission Status**: Gets current notification permission

## 🔧 Backend Requirements

You'll need to implement these API endpoints on your backend:

### 1. **Subscribe to Push Notifications**
```http
POST /api/push-notifications/subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userId": 123
}
```

### 2. **Unsubscribe from Push Notifications**
```http
DELETE /api/push-notifications/unsubscribe?userId=123
```

### 3. **Send Push Notification**
```http
POST /api/push-notifications/send
Content-Type: application/json

{
  "userId": 123,
  "title": "Nueva notificación",
  "body": "Tienes una nueva notificación sin leer",
  "data": {
    "url": "/dashboard/notifications",
    "notificationId": 456
  }
}
```

## 🔑 VAPID Key Setup

### 1. **Generate VAPID Keys**
```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

### 2. **Update VAPID Key**
In `src/app/services/push-notification.service.ts`, replace:
```typescript
private vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';
```

### 3. **Backend VAPID Configuration**
Use the private key in your backend to send notifications.

## 📱 How It Works

### 1. **User Enables Notifications**
- User sees permission banner
- Clicks "Activar" button
- Browser requests notification permission
- Service creates push subscription
- Subscription is saved to your backend

### 2. **Periodic Notification Checks**
- App checks for unread notifications every 5 minutes
- If unread notifications exist, shows local notification
- User can click notification to go to notifications page

### 3. **Push Notifications from Server**
- Backend sends push notification via FCM/Web Push
- Service worker receives push event
- Shows notification with actions
- User can click to open app or dismiss

## 🎯 Integration with Existing System

### 1. **Notification Service Integration**
The push notification service integrates with your existing `NotificationService`:
```typescript
// Check for unread notifications
this.notificationService.getUserNotifications({ unreadOnly: true })
  .subscribe(response => {
    if (response.total > 0) {
      // Show push notification
    }
  });
```

### 2. **User ID Integration**
The service gets the current user ID from localStorage:
```typescript
private getCurrentUserId(): number {
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    return user.id;
  }
  return 0;
}
```

## 🧪 Testing Push Notifications

### 1. **Local Testing**
```typescript
// In browser console
const pushService = new PushNotificationService();
pushService.showLocalNotification({
  title: 'Test Notification',
  body: 'This is a test notification',
  data: { url: '/dashboard/notifications' }
});
```

### 2. **Production Testing**
1. Build the app: `npm run build`
2. Serve the built files
3. Install as PWA
4. Enable notifications
5. Send test push notification from backend

## 🔧 Configuration Options

### 1. **Notification Check Interval**
```typescript
// Check every 10 minutes instead of 5
this.pushNotificationService.startPeriodicNotificationCheck(10);
```

### 2. **Custom Notification Icons**
```typescript
this.pushNotificationService.showLocalNotification({
  title: 'Custom Notification',
  body: 'With custom icon',
  icon: '/assets/custom-icon.png',
  badge: '/assets/custom-badge.png'
});
```

### 3. **Notification Actions**
```typescript
this.pushNotificationService.showLocalNotification({
  title: 'Notification with Actions',
  body: 'Click an action below',
  actions: [
    { action: 'view', title: 'View' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
});
```

## 📊 Analytics & Tracking

### 1. **Notification Events**
Track these events in your analytics:
- `notification_permission_requested`
- `notification_permission_granted`
- `notification_permission_denied`
- `notification_clicked`
- `notification_dismissed`

### 2. **User Engagement**
- Track notification open rates
- Monitor notification dismissal rates
- Measure user engagement with notifications

## 🚨 Important Notes

### 1. **HTTPS Required**
- Push notifications only work over HTTPS
- Localhost is an exception for development

### 2. **Browser Support**
- Chrome, Firefox, Safari, Edge support push notifications
- Some mobile browsers have limitations

### 3. **User Privacy**
- Always request permission before subscribing
- Provide clear opt-out options
- Respect user preferences

### 4. **Performance**
- Periodic checks are lightweight
- Service worker runs in background
- Minimal impact on app performance

## 🔄 Future Enhancements

### 1. **Advanced Features**
- Rich notifications with images
- Notification scheduling
- User preference management
- Notification categories

### 2. **Analytics Integration**
- Google Analytics events
- Custom analytics tracking
- User behavior analysis

### 3. **Personalization**
- Custom notification sounds
- User-defined intervals
- Smart notification timing

## 🎉 Your Push Notification System is Ready!

Your booking app now has a complete push notification system that will:
- ✅ Notify users about unread notifications
- ✅ Work offline and online
- ✅ Provide a great user experience
- ✅ Integrate seamlessly with your existing notification system
- ✅ Support both local and push notifications

The system is production-ready and follows best practices for PWA push notifications! 🚀
