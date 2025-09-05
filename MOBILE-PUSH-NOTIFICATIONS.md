# 📱 Mobile Push Notifications Guide

## 🚀 How Push Notifications Work on Mobile

Push notifications work perfectly on mobile devices, even when the PWA is closed or minimized. Here's how:

### **✅ When PWA is Closed/Minimized:**

1. **Service Worker Active**: Runs in background independently
2. **Push Events Received**: Service worker receives push notifications
3. **System Notifications**: Shows native mobile notifications
4. **App Launch**: Clicking notification opens/launches PWA

### **📱 Mobile-Specific Features:**

- **Vibration**: Custom vibration patterns
- **Sound**: Notification sounds (if not silenced)
- **Badge**: App icon badge with unread count
- **Actions**: Quick action buttons
- **Deep Linking**: Opens specific pages in PWA

## 🔧 Mobile Optimization Settings

### **Service Worker Configuration:**

```javascript
// Mobile-optimized notification settings
{
  title: 'Notification Title',
  body: 'Notification message',
  icon: '/assets/icons/icon-192x192.png',
  badge: '/assets/icons/icon-72x72.png',
  vibrate: [200, 100, 200], // Vibration pattern
  silent: false, // Ensure sound plays
  renotify: true, // Replace existing notifications
  requireInteraction: true, // Stay visible until user interacts
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
}
```

## 📲 Mobile Testing

### **1. Install PWA on Mobile:**

1. **Open in Mobile Browser**: Navigate to your PWA URL
2. **Install Prompt**: Look for "Add to Home Screen" or "Install" button
3. **Install PWA**: Tap to install as native app
4. **Enable Notifications**: Grant permission when prompted

### **2. Test Push Notifications:**

```bash
# Test with curl (replace with your actual values)
curl -X POST https://alce-api.porto-rockcity-app.com/v0/api/push-notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Mobile Notification",
    "body": "This notification will appear even when PWA is closed!",
    "data": {
      "url": "/dashboard/notifications"
    }
  }'
```

### **3. Test Scenarios:**

- ✅ **PWA Open**: Notification appears, updates count
- ✅ **PWA Minimized**: Notification appears in system tray
- ✅ **PWA Closed**: Notification appears, clicking launches PWA
- ✅ **Phone Locked**: Notification appears on lock screen
- ✅ **Background**: Service worker handles notifications

## 🎯 Mobile-Specific Features

### **1. Vibration Patterns:**

```javascript
// Different vibration patterns for different notification types
vibrate: [200, 100, 200], // Standard notification
vibrate: [100, 50, 100, 50, 100], // Urgent notification
vibrate: [300], // Simple notification
```

### **2. Badge Count:**

```javascript
// App icon badge shows unread count
badge: '/assets/icons/icon-72x72.png'
```

### **3. Deep Linking:**

```javascript
// Opens specific page when notification is clicked
data: {
  url: '/dashboard/notifications',
  notificationId: 123
}
```

## 🔧 PWA Manifest for Mobile

Ensure your `manifest.json` includes mobile-specific settings:

```json
{
  "name": "Alce College Booking App",
  "short_name": "Alce College",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 📱 Mobile Browser Support

### **✅ Supported:**
- **Chrome Mobile**: Full support
- **Safari iOS**: Full support (iOS 16.4+)
- **Firefox Mobile**: Full support
- **Edge Mobile**: Full support
- **Samsung Internet**: Full support

### **⚠️ Limitations:**
- **iOS Safari**: Requires iOS 16.4+ for full PWA support
- **Some Android browsers**: May have limited PWA features

## 🚀 Production Deployment

### **1. HTTPS Required:**
```bash
# Push notifications only work over HTTPS
https://alce-pwa.porto-rockcity-app.com/
```

### **2. Service Worker Registration:**
```typescript
// Ensure service worker is registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ngsw-worker.js');
}
```

### **3. VAPID Keys:**
```typescript
// Use production VAPID keys
VAPID_PUBLIC_KEY=your_production_public_key
VAPID_PRIVATE_KEY=your_production_private_key
```

## 🎉 Expected Mobile Experience

### **When Push Notification Arrives:**

1. **PWA Closed**: 
   - System notification appears
   - App icon shows badge count
   - Phone vibrates (if enabled)
   - Sound plays (if not silenced)

2. **PWA Minimized**:
   - System notification appears
   - Badge count updates
   - Vibration and sound

3. **PWA Open**:
   - In-app notification appears
   - Count updates in real-time
   - User can interact immediately

### **When User Clicks Notification:**

1. **PWA Launches** (if closed)
2. **PWA Focuses** (if minimized)
3. **Navigates to specific page**
4. **Updates unread count**
5. **Shows notification content**

## 🔍 Troubleshooting Mobile Issues

### **Common Issues:**

1. **Notifications not appearing**:
   - Check notification permissions
   - Verify HTTPS
   - Check service worker registration

2. **PWA not launching**:
   - Ensure PWA is properly installed
   - Check manifest.json
   - Verify start_url

3. **Badge not updating**:
   - Check icon sizes
   - Verify badge icon path
   - Test on different devices

### **Debug Steps:**

1. **Check Service Worker**:
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(console.log);
   ```

2. **Check Notifications**:
   ```javascript
   // Check permission
   console.log(Notification.permission);
   ```

3. **Check PWA Installation**:
   ```javascript
   // Check if PWA is installed
   console.log(window.matchMedia('(display-mode: standalone)').matches);
   ```

Your push notifications will work perfectly on mobile devices, even when the PWA is closed or minimized! 🚀📱
