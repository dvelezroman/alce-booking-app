import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

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
  
  private subscriptionSubject = new BehaviorSubject<PushSubscription | null>(null);
  public subscription$ = this.subscriptionSubject.asObservable();
  
  private permissionSubject = new BehaviorSubject<NotificationPermission>('default');
  public permission$ = this.permissionSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
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
      console.error('Error requesting notification permission:', error);
      this.permissionSubject.next('denied');
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      this.subscriptionSubject.next(pushSubscription);
      await this.saveSubscriptionToServer(pushSubscription);
      
      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
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
      console.error('Error unsubscribing from push notifications:', error);
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
      console.error('Error loading existing subscription:', error);
    }
  }

  /**
   * Save subscription to server
   */
  private async saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await this.http.post(`${this.apiUrl}/subscribe`, {
        subscription,
        userId: this.getCurrentUserId()
      }).toPromise();
    } catch (error) {
      console.error('Error saving subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await this.http.delete(`${this.apiUrl}/unsubscribe`, {
        params: { userId: this.getCurrentUserId().toString() }
      }).toPromise();
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  /**
   * Show local notification
   */
  showLocalNotification(payload: PushNotificationPayload): void {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
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

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
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
    return this.notificationService.getNotifications({ 
      unreadOnly: true,
      userId: this.getCurrentUserId()
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
        console.error('Error checking unread notifications:', error);
        return of(false);
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
   * Get current user ID from localStorage or store
   */
  private getCurrentUserId(): number {
    // This should match how you get the current user ID in your app
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return 0; // Fallback
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
}
