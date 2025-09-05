# 🧪 Push Notification Testing Guide

## 🎯 Complete Flow Overview

The push notification system works as follows:

1. **User subscribes** to push notifications in PWA
2. **Admin creates notification** via your existing notification system
3. **Backend automatically sends** push notifications to recipients
4. **Users receive push notifications** and can click to open PWA

## 🚀 Step-by-Step Testing

### **Step 1: Setup Environment**

1. **Generate VAPID Keys** (if not done):
```bash
npm install -g web-push
web-push generate-vapid-keys
```

2. **Update Backend Environment** (`.env` file):
```env
VAPID_PUBLIC_KEY=BOVYepzMrdf4xm-otXeH_iTT-8A6-ZxbSCA_sk6GJoPJn5sjlNFZejP5AQtCMyMzAsBn-ToWKcTXhclm_sSTgZA
VAPID_PRIVATE_KEY=your_generated_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

3. **Start Backend**:
```bash
# In your NestJS project
npm run start:dev
```

### **Step 2: Build and Serve PWA**

1. **Build Angular App**:
```bash
npm run build
```

2. **Serve PWA**:
```bash
npx serve -s dist/booking-app/browser -l 3000
```

3. **Open in Browser**: `http://localhost:3000`

### **Step 3: Install PWA and Enable Notifications**

1. **Install PWA**:
   - Look for "Install" button in Chrome/Edge address bar
   - Click "Install" to install the PWA
   - Open the installed PWA

2. **Enable Push Notifications**:
   - Navigate to notifications section
   - Click "Activar" button when you see the permission banner
   - Grant permission when browser asks
   - Verify subscription in browser console

### **Step 4: Test Complete Flow**

#### **Option A: Using Test Script**

1. **Install Dependencies**:
```bash
npm install axios
```

2. **Update Test Script**:
   - Open `test-complete-notification-flow.js`
   - Replace `YOUR_JWT_TOKEN_HERE` with real JWT token
   - Update `TEST_ADMIN_ID` and `TEST_RECIPIENT_ID` with real user IDs

3. **Run Test**:
```bash
node test-complete-notification-flow.js
```

#### **Option B: Manual Testing**

1. **Create Notification via Frontend**:
   - Login as admin user
   - Go to notifications section
   - Create a new notification
   - Select a recipient who has push notifications enabled

2. **Verify Push Notification**:
   - Check recipient's device for push notification
   - Click notification to open PWA
   - Verify PWA opens to notifications page

#### **Option C: Direct API Testing**

1. **Test Push Subscription**:
```bash
curl -X GET http://localhost:3300/v0/api/push-notifications/subscriptions/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Create Notification**:
```bash
curl -X POST http://localhost:3300/v0/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "from": 1,
    "to": [2],
    "scope": "INDIVIDUAL",
    "title": "Test Notification",
    "message": {
      "body": "This is a test notification!"
    },
    "notificationType": "Announce",
    "priority": 1,
    "scheduledAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "expiresAt": "'$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%S.%3NZ)'"
  }'
```

3. **Test Direct Push Notification**:
```bash
curl -X POST http://localhost:3300/v0/api/push-notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 2,
    "title": "Direct Test",
    "body": "This is a direct push notification test!",
    "data": {
      "url": "/dashboard/notifications"
    }
  }'
```

## 🔍 Troubleshooting

### **Common Issues**

1. **No Push Notifications Received**:
   - Check if user has subscribed to push notifications
   - Verify VAPID keys are correct
   - Check browser console for errors
   - Ensure HTTPS (except localhost)

2. **Subscription Failed**:
   - Check VAPID public key in frontend
   - Verify service worker is registered
   - Check browser notification permissions

3. **Backend Errors**:
   - Verify VAPID keys in backend environment
   - Check database connection
   - Verify push subscription table exists

### **Debug Steps**

1. **Check Browser Console**:
   - Open DevTools → Console
   - Look for push notification related logs

2. **Check Service Worker**:
   - DevTools → Application → Service Workers
   - Verify service worker is active

3. **Check Push Subscriptions**:
   - DevTools → Application → Storage → IndexedDB
   - Look for push subscription data

4. **Check Backend Logs**:
   - Monitor NestJS console for push notification logs
   - Check for web-push errors

## ✅ Expected Results

### **Successful Flow**

1. ✅ User subscribes to push notifications
2. ✅ Subscription saved to database
3. ✅ Admin creates notification
4. ✅ Backend automatically sends push notifications
5. ✅ Recipients receive push notifications
6. ✅ Clicking notification opens PWA
7. ✅ PWA navigates to notifications page

### **Verification Points**

- [ ] Push subscription created in database
- [ ] Notification created in database
- [ ] Push notification sent successfully
- [ ] User receives push notification
- [ ] Clicking notification opens PWA
- [ ] PWA navigates to correct page

## 🎉 Success!

Once all steps work correctly, your push notification system is fully functional! Users will automatically receive push notifications when new notifications are created, and can click them to open your PWA.

## 📱 Production Considerations

1. **HTTPS Required**: Push notifications only work over HTTPS in production
2. **VAPID Keys**: Use production VAPID keys for production environment
3. **Error Handling**: Implement proper error handling for failed push notifications
4. **Analytics**: Track notification delivery and click rates
5. **User Preferences**: Allow users to customize notification settings
