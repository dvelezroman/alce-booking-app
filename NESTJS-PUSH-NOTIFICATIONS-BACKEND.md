# NestJS Backend Implementation for Push Notifications

## 🚀 Overview
This guide shows you exactly what to implement in your NestJS API to support the push notification system we created for your PWA.

## 📦 Required Dependencies

First, install the necessary packages:

```bash
npm install web-push
npm install @types/web-push --save-dev
```

## 🔧 Environment Configuration

Add these environment variables to your `.env` file:

```env
# VAPID Keys (generate with: web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com

# Optional: Firebase Cloud Messaging (if using FCM)
FCM_SERVER_KEY=your_fcm_server_key_here
```

## 🏗️ Database Schema

You'll need to store push subscriptions. Add this to your database:

```sql
-- Push Subscriptions Table
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh_key VARCHAR(255) NOT NULL,
  auth_key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, endpoint)
);

-- Index for better performance
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active);
```

## 📁 File Structure

Create these files in your NestJS project:

```
src/
├── push-notifications/
│   ├── dto/
│   │   ├── push-subscription.dto.ts
│   │   └── send-notification.dto.ts
│   ├── entities/
│   │   └── push-subscription.entity.ts
│   ├── push-notifications.controller.ts
│   ├── push-notifications.service.ts
│   └── push-notifications.module.ts
└── notifications/
    └── notifications.service.ts (update existing)
```

## 🗂️ DTOs (Data Transfer Objects)

### `src/push-notifications/dto/push-subscription.dto.ts`

```typescript
import { IsString, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PushKeysDto {
  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

export class PushSubscriptionDto {
  @IsString()
  endpoint: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

export class SubscribeToPushDto {
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;

  @IsNumber()
  userId: number;
}

export class UnsubscribeFromPushDto {
  @IsNumber()
  userId: number;
}
```

### `src/push-notifications/dto/send-notification.dto.ts`

```typescript
import { IsString, IsNumber, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class SendNotificationDto {
  @IsNumber()
  userId: number;

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
}

export class SendBulkNotificationDto {
  @IsNumber({}, { each: true })
  userIds: number[];

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
}
```

## 🏛️ Entity

### `src/push-notifications/entities/push-subscription.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('push_subscriptions')
@Index(['userId', 'endpoint'], { unique: true })
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ length: 500 })
  endpoint: string;

  @Column({ name: 'p256dh_key' })
  p256dhKey: string;

  @Column({ name: 'auth_key' })
  authKey: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

## 🎯 Service

### `src/push-notifications/push-notifications.service.ts`

```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { PushSubscription } from './entities/push-subscription.entity';
import { SubscribeToPushDto, SendNotificationDto, SendBulkNotificationDto } from './dto';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepository: Repository<PushSubscription>,
    private configService: ConfigService,
  ) {
    // Configure web-push with VAPID keys
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT');

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      throw new Error('VAPID keys are not configured');
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey,
    );
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribeToPush(subscribeDto: SubscribeToPushDto): Promise<PushSubscription> {
    const { subscription, userId } = subscribeDto;

    try {
      // Check if subscription already exists
      const existingSubscription = await this.pushSubscriptionRepository.findOne({
        where: { userId, endpoint: subscription.endpoint }
      });

      if (existingSubscription) {
        // Update existing subscription
        existingSubscription.p256dhKey = subscription.keys.p256dh;
        existingSubscription.authKey = subscription.keys.auth;
        existingSubscription.isActive = true;
        existingSubscription.updatedAt = new Date();
        
        return await this.pushSubscriptionRepository.save(existingSubscription);
      }

      // Create new subscription
      const pushSubscription = this.pushSubscriptionRepository.create({
        userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        isActive: true,
      });

      const savedSubscription = await this.pushSubscriptionRepository.save(pushSubscription);
      
      this.logger.log(`User ${userId} subscribed to push notifications`);
      return savedSubscription;
    } catch (error) {
      this.logger.error(`Error subscribing user ${userId} to push notifications:`, error);
      throw new BadRequestException('Failed to subscribe to push notifications');
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribeFromPush(userId: number): Promise<void> {
    try {
      await this.pushSubscriptionRepository.update(
        { userId },
        { isActive: false, updatedAt: new Date() }
      );
      
      this.logger.log(`User ${userId} unsubscribed from push notifications`);
    } catch (error) {
      this.logger.error(`Error unsubscribing user ${userId} from push notifications:`, error);
      throw new BadRequestException('Failed to unsubscribe from push notifications');
    }
  }

  /**
   * Send push notification to a specific user
   */
  async sendNotificationToUser(sendDto: SendNotificationDto): Promise<void> {
    const { userId, ...notificationPayload } = sendDto;

    try {
      const subscriptions = await this.pushSubscriptionRepository.find({
        where: { userId, isActive: true }
      });

      if (subscriptions.length === 0) {
        this.logger.warn(`No active push subscriptions found for user ${userId}`);
        return;
      }

      const payload = JSON.stringify({
        title: notificationPayload.title,
        body: notificationPayload.body,
        icon: notificationPayload.icon || '/assets/icons/icon-192x192.png',
        badge: notificationPayload.badge || '/assets/icons/icon-72x72.png',
        tag: notificationPayload.tag || 'notification',
        data: notificationPayload.data || {},
        requireInteraction: notificationPayload.requireInteraction || false,
        silent: notificationPayload.silent || false,
      });

      const promises = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey,
            },
          };

          await webpush.sendNotification(pushSubscription, payload);
          this.logger.log(`Push notification sent to user ${userId}`);
        } catch (error) {
          this.logger.error(`Failed to send push notification to user ${userId}:`, error);
          
          // If subscription is invalid, mark it as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.pushSubscriptionRepository.update(
              { id: subscription.id },
              { isActive: false, updatedAt: new Date() }
            );
          }
        }
      });

      await Promise.all(promises);
    } catch (error) {
      this.logger.error(`Error sending push notification to user ${userId}:`, error);
      throw new BadRequestException('Failed to send push notification');
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulkNotification(sendDto: SendBulkNotificationDto): Promise<void> {
    const { userIds, ...notificationPayload } = sendDto;

    const promises = userIds.map(userId => 
      this.sendNotificationToUser({ userId, ...notificationPayload })
    );

    await Promise.all(promises);
    this.logger.log(`Bulk push notification sent to ${userIds.length} users`);
  }

  /**
   * Send notification about unread notifications
   */
  async sendUnreadNotificationAlert(userId: number, unreadCount: number): Promise<void> {
    await this.sendNotificationToUser({
      userId,
      title: 'Nuevas notificaciones',
      body: `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`,
      tag: 'unread-notifications',
      data: { url: '/dashboard/notifications' },
      requireInteraction: true,
    });
  }

  /**
   * Send class reminder notification
   */
  async sendClassReminder(userId: number, className: string, time: string): Promise<void> {
    await this.sendNotificationToUser({
      userId,
      title: 'Recordatorio de clase',
      body: `Tu clase "${className}" es en ${time}`,
      tag: 'class-reminder',
      data: { url: '/dashboard/meetings' },
      requireInteraction: true,
    });
  }

  /**
   * Get user's push subscriptions
   */
  async getUserSubscriptions(userId: number): Promise<PushSubscription[]> {
    return await this.pushSubscriptionRepository.find({
      where: { userId, isActive: true }
    });
  }

  /**
   * Clean up inactive subscriptions
   */
  async cleanupInactiveSubscriptions(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    await this.pushSubscriptionRepository.delete({
      isActive: false,
      updatedAt: { $lt: cutoffDate } as any
    });

    this.logger.log('Cleaned up inactive push subscriptions');
  }
}
```

## 🎮 Controller

### `src/push-notifications/push-notifications.controller.ts`

```typescript
import { 
  Controller, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { 
  SubscribeToPushDto, 
  SendNotificationDto, 
  SendBulkNotificationDto 
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust path as needed

@Controller('api/push-notifications')
@UseGuards(JwtAuthGuard)
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  /**
   * Subscribe to push notifications
   */
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribeToPush(@Body() subscribeDto: SubscribeToPushDto) {
    return await this.pushNotificationsService.subscribeToPush(subscribeDto);
  }

  /**
   * Unsubscribe from push notifications
   */
  @Delete('unsubscribe')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribeFromPush(@Query('userId') userId: number) {
    await this.pushNotificationsService.unsubscribeFromPush(userId);
  }

  /**
   * Send notification to specific user
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Body() sendDto: SendNotificationDto) {
    await this.pushNotificationsService.sendNotificationToUser(sendDto);
    return { message: 'Notification sent successfully' };
  }

  /**
   * Send notification to multiple users
   */
  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  async sendBulkNotification(@Body() sendDto: SendBulkNotificationDto) {
    await this.pushNotificationsService.sendBulkNotification(sendDto);
    return { message: 'Bulk notification sent successfully' };
  }

  /**
   * Send unread notification alert
   */
  @Post('unread-alert/:userId')
  @HttpCode(HttpStatus.OK)
  async sendUnreadAlert(
    @Param('userId') userId: number,
    @Query('count') count: number
  ) {
    await this.pushNotificationsService.sendUnreadNotificationAlert(userId, count);
    return { message: 'Unread notification alert sent' };
  }

  /**
   * Send class reminder
   */
  @Post('class-reminder/:userId')
  @HttpCode(HttpStatus.OK)
  async sendClassReminder(
    @Param('userId') userId: number,
    @Body() reminderData: { className: string; time: string }
  ) {
    await this.pushNotificationsService.sendClassReminder(
      userId, 
      reminderData.className, 
      reminderData.time
    );
    return { message: 'Class reminder sent' };
  }

  /**
   * Get user subscriptions
   */
  @Post('subscriptions/:userId')
  async getUserSubscriptions(@Param('userId') userId: number) {
    return await this.pushNotificationsService.getUserSubscriptions(userId);
  }
}
```

## 📦 Module

### `src/push-notifications/push-notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PushNotificationsController } from './push-notifications.controller';
import { PushNotificationsService } from './push-notifications.service';
import { PushSubscription } from './entities/push-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscription]),
    ConfigModule,
  ],
  controllers: [PushNotificationsController],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
```

## 🔄 Integration with Existing Notifications

### Update your existing notifications service

```typescript
// In your existing notifications.service.ts
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    // ... existing dependencies
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async createNotification(createData: CreateNotificationDto): Promise<Notification> {
    // ... existing notification creation logic
    
    // Send push notification to recipients
    const recipients = createData.to;
    for (const userId of recipients) {
      try {
        await this.pushNotificationsService.sendNotificationToUser({
          userId,
          title: createData.title,
          body: createData.message.body,
          data: {
            url: '/dashboard/notifications',
            notificationId: savedNotification.id
          },
          requireInteraction: true,
        });
      } catch (error) {
        console.error(`Failed to send push notification to user ${userId}:`, error);
      }
    }

    return savedNotification;
  }
}
```

## 🚀 Usage Examples

### 1. **Send Unread Notification Alert**
```typescript
// In your notifications service
async checkAndSendUnreadAlerts() {
  const usersWithUnread = await this.getUsersWithUnreadNotifications();
  
  for (const user of usersWithUnread) {
    await this.pushNotificationsService.sendUnreadNotificationAlert(
      user.id, 
      user.unreadCount
    );
  }
}
```

### 2. **Send Class Reminders**
```typescript
// In your meetings service
async sendClassReminders() {
  const upcomingClasses = await this.getUpcomingClasses();
  
  for (const classItem of upcomingClasses) {
    await this.pushNotificationsService.sendClassReminder(
      classItem.studentId,
      classItem.className,
      classItem.timeRemaining
    );
  }
}
```

### 3. **Send System Announcements**
```typescript
// Send to all users
await this.pushNotificationsService.sendBulkNotification({
  userIds: allUserIds,
  title: 'Mantenimiento programado',
  body: 'El sistema estará en mantenimiento mañana de 2-4 AM',
  requireInteraction: true,
});
```

## 🔧 Testing

### 1. **Test Push Subscription**
```bash
curl -X POST http://localhost:3000/api/push-notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    },
    "userId": 123
  }'
```

### 2. **Test Send Notification**
```bash
curl -X POST http://localhost:3000/api/push-notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 123,
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {
      "url": "/dashboard/notifications"
    }
  }'
```

## 🎯 Your Backend is Ready!

With this implementation, your NestJS API will:

- ✅ **Store push subscriptions** in the database
- ✅ **Send push notifications** to users
- ✅ **Handle subscription management** (subscribe/unsubscribe)
- ✅ **Support bulk notifications** for announcements
- ✅ **Integrate with existing notifications** system
- ✅ **Clean up inactive subscriptions** automatically
- ✅ **Provide proper error handling** and logging

The frontend push notification system will work seamlessly with this backend! 🚀
