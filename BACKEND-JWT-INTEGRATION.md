# Backend JWT Integration for Push Notifications

## 🔐 JWT Token Extraction

The backend should extract the `userId` from the JWT token instead of relying on the frontend to send it. This is more secure and prevents the `userId: 0` issue.

## 📝 Updated Backend Implementation

### **1. Subscribe to Push Notifications**

**Endpoint**: `POST /api/push-notifications/subscribe`

**Request Body** (Frontend sends):
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Backend Implementation**:
```typescript
@Post('subscribe')
@HttpCode(HttpStatus.CREATED)
@UseGuards(JwtAuthGuard) // This extracts userId from JWT
async subscribeToPush(
  @Body() subscribeDto: { subscription: PushSubscriptionDto },
  @Request() req: any // Contains user data from JWT
) {
  const userId = req.user.id; // Extract from JWT token
  
  return await this.pushNotificationsService.subscribeToPush({
    subscription: subscribeDto.subscription,
    userId: userId
  });
}
```

### **2. Unsubscribe from Push Notifications**

**Endpoint**: `DELETE /api/push-notifications/unsubscribe`

**Request**: No body needed, userId extracted from JWT

**Backend Implementation**:
```typescript
@Delete('unsubscribe')
@HttpCode(HttpStatus.NO_CONTENT)
@UseGuards(JwtAuthGuard)
async unsubscribeFromPush(@Request() req: any) {
  const userId = req.user.id; // Extract from JWT token
  
  await this.pushNotificationsService.unsubscribeFromPush(userId);
}
```

### **3. Send Push Notification**

**Endpoint**: `POST /api/push-notifications/send`

**Request Body**:
```json
{
  "title": "Notification Title",
  "body": "Notification message",
  "data": {
    "url": "/dashboard/notifications",
    "notificationId": 123
  }
}
```

**Backend Implementation**:
```typescript
@Post('send')
@HttpCode(HttpStatus.OK)
@UseGuards(JwtAuthGuard)
async sendNotification(
  @Body() sendDto: SendNotificationDto,
  @Request() req: any
) {
  const userId = req.user.id; // Extract from JWT token
  
  await this.pushNotificationsService.sendNotificationToUser({
    userId: userId,
    ...sendDto
  });
  
  return { message: 'Notification sent successfully' };
}
```

## 🔧 Updated DTOs

### **SubscribeToPushDto** (Updated)
```typescript
export class SubscribeToPushDto {
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;
  
  // userId removed - will be extracted from JWT
}
```

### **SendNotificationDto** (Updated)
```typescript
export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsBoolean()
  requireInteraction?: boolean;

  @IsOptional()
  @IsBoolean()
  silent?: boolean;
  
  // userId removed - will be extracted from JWT
}
```

## 🚀 Benefits

1. **Security**: User ID comes from verified JWT token
2. **Simplicity**: Frontend doesn't need to manage user ID
3. **Reliability**: No more `userId: 0` issues
4. **Consistency**: All endpoints use the same authentication pattern

## 📱 Frontend Changes

The frontend now sends:
- **Subscribe**: Only the push subscription object
- **Unsubscribe**: No parameters (JWT provides user ID)
- **Send**: Only notification data (JWT provides user ID)

## 🔍 Testing

Test with JWT token in Authorization header:
```bash
curl -X POST http://localhost:3300/v0/api/push-notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    }
  }'
```

The backend will automatically extract the user ID from the JWT token! 🚀
