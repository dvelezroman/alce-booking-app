import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, firstValueFrom } from 'rxjs';
import { catchError, switchMap, tap, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { Store } from '@ngrx/store';
import { selectUserData } from '../store/user.selector';
import { NotificationCountService } from './notification-count.service';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private apiUrl = `${environment.apiUrl}/push-notifications`;
  private vapidPublicKey = environment.vapidPublicKey;

  /**
   * Log only in development mode
   */
  private devLog(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(`[PushNotification] ${message}`, ...args);
    }
  }

  /**
   * Log errors in both development and production
   */
  private errorLog(message: string, ...args: any[]): void {
    console.error(`[PushNotification] ${message}`, ...args);
  }
  
  private subscriptionSubject = new BehaviorSubject<PushSubscription | null>(null);
  public subscription$ = this.subscriptionSubject.asObservable();
  
  private permissionSubject = new BehaviorSubject<NotificationPermission>('default');
  public permission$ = this.permissionSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private store: Store,
    private notificationCountService: NotificationCountService
  ) {
    this.checkPermission();
    this.loadExistingSubscription();
  }

  /**
   * Check current notification permission status
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permissionSubject.next(Notification.permission);
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.permissionSubject.next('granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      this.permissionSubject.next('denied');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionSubject.next(permission);
      return permission;
    } catch (error) {
      this.errorLog('Error requesting notification permission:', error);
      this.permissionSubject.next('denied');
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    this.devLog('Starting push notification subscription process...');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      this.devLog('Push messaging is not supported');
      return null;
    }

    this.devLog('Push messaging is supported, requesting permission...');
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      this.devLog('Notification permission not granted:', permission);
      return null;
    }

    this.devLog('Permission granted, creating push subscription...');
    try {
      const registration = await navigator.serviceWorker.ready;
      this.devLog('Service worker ready, subscribing to push manager...');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.devLog('Push subscription created:', {
        endpoint: subscription.endpoint,
        hasKeys: !!subscription.getKey('p256dh') && !!subscription.getKey('auth')
      });

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      this.devLog('Push subscription object created, saving to server...');
      this.subscriptionSubject.next(pushSubscription);
      await this.saveSubscriptionToServer(pushSubscription);
      
      this.devLog('Push subscription process completed successfully');
      return pushSubscription;
    } catch (error) {
      this.errorLog('Error subscribing to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        this.subscriptionSubject.next(null);
        await this.removeSubscriptionFromServer();
        return true;
      }
      return false;
    } catch (error) {
      this.errorLog('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Load existing push subscription
   */
  private async loadExistingSubscription(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const pushSubscription: PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          }
        };
        this.subscriptionSubject.next(pushSubscription);
      }
    } catch (error) {
      this.errorLog('Error loading existing subscription:', error);
    }
  }

  /**
   * Save subscription to server
   */
  private async saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const requestBody = {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
          }
        }
      };

      this.devLog('Saving push subscription to server:', {
        apiUrl: this.apiUrl,
        endpoint: subscription.endpoint,
        hasKeys: !!subscription.keys,
        requestBody: requestBody
      });

      const response = await firstValueFrom(this.http.post(`${this.apiUrl}/subscribe`, requestBody));

      this.devLog('Push subscription saved successfully:', response);
      
      // Verify the response structure
      if (response && typeof response === 'object') {
        this.devLog('Response contains:', {
          id: (response as any).id,
          userId: (response as any).userId,
          isActive: (response as any).isActive,
          createdAt: (response as any).createdAt
        });
      }
    } catch (error) {
      this.errorLog('Error saving subscription to server:', error);
      this.devLog('API URL:', this.apiUrl);
      this.devLog('Subscription data:', subscription);
      
      // Log more details about the error
      if (error instanceof Error) {
        this.errorLog('Error message:', error.message);
        this.devLog('Error stack:', error.stack);
      }
      
      // Log HTTP error details if available
      if (error && typeof error === 'object' && 'status' in error) {
        this.errorLog('HTTP Error Status:', (error as any).status);
        this.errorLog('HTTP Error Message:', (error as any).message);
        this.errorLog('HTTP Error Body:', (error as any).error);
      }
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      // Backend will extract userId from JWT token
      await firstValueFrom(this.http.delete(`${this.apiUrl}/unsubscribe`));
    } catch (error) {
      this.errorLog('Error removing subscription from server:', error);
    }
  }

  /**
   * Show local notification
   */
  showLocalNotification(payload: PushNotificationPayload): void {
    if (Notification.permission !== 'granted') {
      this.devLog('Notification permission not granted');
      return;
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/assets/icons/icon-192x192.png',
      badge: payload.badge || '/assets/icons/icon-72x72.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false
    });

    // Increment unread count when showing local notification
    this.notificationCountService.incrementCount();

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // Decrement unread count when notification is clicked
      this.notificationCountService.decrementCount();
      
      // Navigate to notifications page or specific notification
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      } else {
        window.location.href = '/dashboard/notifications';
      }
      
      notification.close();
    };

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!payload.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  /**
   * Check for unread notifications and show push notification
   */
  checkUnreadNotifications(): Observable<boolean> {
    return this.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId || userId === 0) {
          this.devLog('Cannot check notifications: user not logged in');
          return of(false);
        }
        
        return this.notificationService.getNotifications({ 
          unreadOnly: true,
          userId: userId
        }).pipe(
          tap((response) => {
            const unreadCount = Array.isArray(response) ? response.length : response.total || 0;
            if (unreadCount > 0) {
              this.showLocalNotification({
                title: 'Nuevas notificaciones',
                body: `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`,
                tag: 'unread-notifications',
                data: { url: '/dashboard/notifications' },
                requireInteraction: true
              });
            }
          }),
          switchMap((response) => {
            const unreadCount = Array.isArray(response) ? response.length : response.total || 0;
            return of(unreadCount > 0);
          }),
          catchError((error) => {
            this.errorLog('Error checking unread notifications:', error);
            return of(false);
          })
        );
      })
    );
  }

  /**
   * Schedule periodic notification checks
   */
  startPeriodicNotificationCheck(intervalMinutes: number = 5): void {
    setInterval(() => {
      this.checkUnreadNotifications().subscribe();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Utility function to convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Utility function to convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get current user ID from store
   */
  private getCurrentUserId(): Observable<number> {
    return this.store.select(selectUserData).pipe(
      take(1),
      switchMap(userData => {
        if (userData && userData.id) {
          return of(userData.id);
        }
        return of(0);
      })
    );
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Get subscription status
   */
  isSubscribed(): Observable<boolean> {
    return this.subscription$.pipe(
      switchMap(subscription => of(!!subscription))
    );
  }

  /**
   * Subscribe to push notifications after user login
   * Call this method after user successfully logs in
   */
  async subscribeAfterLogin(): Promise<PushSubscription | null> {
    // Check if already subscribed
    const currentSubscription = this.subscriptionSubject.value;
    if (currentSubscription) {
      this.devLog('Already subscribed to push notifications');
      return currentSubscription;
    }

    // Subscribe to push notifications
    return await this.subscribeToPush();
  }

  /**
   * Check if user is logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    const userId = await firstValueFrom(this.getCurrentUserId());
    return !!(userId && userId > 0);
  }

  /**
   * Check if user has an active push subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      this.devLog('Checking if user has active push subscription...');
      
      const response = await firstValueFrom(this.http.get<{
        hasActiveSubscription: boolean;
        subscriptionCount: number;
        userId: number;
      }>(`${this.apiUrl}/has-subscription`));

      this.devLog('Subscription check response:', response);
      
      return response?.hasActiveSubscription || false;
    } catch (error) {
      this.errorLog('Error checking active subscription:', error);
      return false;
    }
  }
}
