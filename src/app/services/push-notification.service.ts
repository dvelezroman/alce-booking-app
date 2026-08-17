import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
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

const PREFERENCE_KEY = 'alce.push.enabled';
const DISMISS_KEY = 'notification-permission-dismissed';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INBOX_URL = '/dashboard/notifications-inbox';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private apiUrl = `${environment.apiUrl}/push-notifications`;
  private cachedVapidPublicKey: string | null = null;

  private lastErrorSubject = new BehaviorSubject<string | null>(null);
  public lastError$ = this.lastErrorSubject.asObservable();

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
    void this.loadExistingSubscription();
  }

  private devLog(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(`[PushNotification] ${message}`, ...args);
    }
  }

  private errorLog(message: string, ...args: any[]): void {
    console.error(`[PushNotification] ${message}`, ...args);
  }

  private setLastError(message: string | null): void {
    this.lastErrorSubject.next(message);
  }

  isPreferenceEnabled(): boolean {
    if (typeof localStorage === 'undefined') {
      return true;
    }
    return localStorage.getItem(PREFERENCE_KEY) !== 'false';
  }

  setPreferenceEnabled(enabled: boolean): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(PREFERENCE_KEY, enabled ? 'true' : 'false');
  }

  isBannerDismissed(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) {
      return false;
    }
    const ts = Number(raw);
    if (!Number.isFinite(ts)) {
      return false;
    }
    return Date.now() - ts < DISMISS_TTL_MS;
  }

  dismissBanner(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  private checkPermission(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionSubject.next(Notification.permission);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
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

  private async resolveVapidPublicKey(): Promise<string> {
    if (this.cachedVapidPublicKey) {
      return this.cachedVapidPublicKey;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`${this.apiUrl}/vapid-key`)
      );
      const key = response?.publicKey?.trim() || '';
      if (key) {
        this.cachedVapidPublicKey = key;
        return key;
      }
    } catch (error) {
      this.errorLog('Failed to fetch VAPID public key from API:', error);
    }

    const fallback = environment.vapidPublicKey?.trim() || '';
    if (fallback) {
      this.devLog('Using environment vapidPublicKey fallback');
      this.cachedVapidPublicKey = fallback;
      return fallback;
    }

    throw new Error('No hay clave VAPID pública configurada en el servidor');
  }

  /**
   * Prod: Angular ngsw-worker (push via payload.notification).
   * Dev: custom-sw.js fallback because ngsw is disabled in isDevMode().
   */
  private async getControllingServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing?.active) {
      this.devLog('Using existing service worker', existing.active.scriptURL);
      return existing;
    }

    const readyOrTimeout = Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    const ready = await readyOrTimeout;
    if (ready) {
      this.devLog('Using controlling service worker', ready.active?.scriptURL);
      return ready;
    }

    const late = await navigator.serviceWorker.getRegistration('/');
    if (late) {
      this.devLog('Using late service worker registration', late.active?.scriptURL);
      return late;
    }

    this.devLog('Registering custom service worker for push (dev/fallback)...');
    return navigator.serviceWorker.register('/custom-sw.js', { scope: '/' });
  }

  async subscribeToPush(options?: { ignorePreference?: boolean }): Promise<PushSubscription | null> {
    this.setLastError(null);
    this.devLog('Starting push notification subscription process...');

    if (!options?.ignorePreference && !this.isPreferenceEnabled()) {
      this.devLog('Push preference is off, skipping subscribe');
      return null;
    }

    if (!this.isSupported()) {
      this.setLastError('Este navegador no soporta notificaciones push');
      this.devLog('Push messaging is not supported');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      this.setLastError(
        permission === 'denied'
          ? 'Las notificaciones están bloqueadas en el navegador. Actívalas en la configuración del sitio.'
          : 'Se necesita permiso para activar las notificaciones'
      );
      this.devLog('Notification permission not granted:', permission);
      return null;
    }

    try {
      const vapidPublicKey = await this.resolveVapidPublicKey();
      const registration = await this.getControllingServiceWorker();
      this.devLog('Push service worker ready, subscribing to push manager...');

      let subscription = await registration.pushManager.getSubscription();
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as ArrayBuffer
        });
      } catch (subscribeError) {
        this.devLog('Subscribe with current VAPID failed, rotating local subscription', subscribeError);
        if (subscription) {
          await subscription.unsubscribe();
        }
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as ArrayBuffer
        });
      }

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      await this.saveSubscriptionToServer(pushSubscription);
      this.subscriptionSubject.next(pushSubscription);
      this.setPreferenceEnabled(true);
      this.devLog('Push subscription process completed successfully');
      return pushSubscription;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'No se pudo activar las notificaciones push';
      this.setLastError(message);
      this.errorLog('Error subscribing to push notifications:', error);
      this.subscriptionSubject.next(null);
      return null;
    }
  }

  async ensureInstalledPwaPushSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported() || !this.isPreferenceEnabled()) {
      return null;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }
    if (Notification.permission !== 'granted') {
      return null;
    }
    return this.subscribeToPush();
  }

  async unsubscribeFromPush(): Promise<boolean> {
    this.setLastError(null);
    try {
      const registration = await this.getControllingServiceWorker();
      const subscription = await registration.pushManager.getSubscription();
      const endpoint = subscription?.endpoint;

      if (subscription) {
        await subscription.unsubscribe();
      }

      await this.removeSubscriptionFromServer(endpoint);
      this.subscriptionSubject.next(null);
      this.setPreferenceEnabled(false);
      return true;
    } catch (error) {
      this.setLastError('No se pudo desactivar las notificaciones push');
      this.errorLog('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  private async loadExistingSubscription(): Promise<void> {
    try {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return;
      }
      const registration = await this.getControllingServiceWorker();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        this.subscriptionSubject.next({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
          }
        });
      }
    } catch (error) {
      this.errorLog('Error loading existing subscription:', error);
    }
  }

  private async saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
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
      hasKeys: !!subscription.keys
    });

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/subscribe`, requestBody)
      );
      this.devLog('Push subscription saved successfully:', response);
    } catch (error) {
      throw new Error(
        this.httpErrorMessage(error, 'No se pudo guardar la suscripción en el servidor')
      );
    }
  }

  private async removeSubscriptionFromServer(endpoint?: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/unsubscribe`, {
          body: endpoint ? { endpoint } : {}
        })
      );
    } catch (error) {
      throw new Error(
        this.httpErrorMessage(error, 'No se pudo quitar la suscripción en el servidor')
      );
    }
  }

  private httpErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const body = (error as { error?: { message?: string | string[] } }).error;
      if (typeof body?.message === 'string' && body.message.trim()) {
        return body.message;
      }
      if (Array.isArray(body?.message) && body.message[0]) {
        return String(body.message[0]);
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }

  showLocalNotification(payload: PushNotificationPayload): void {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') {
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

    this.notificationCountService.incrementCount();

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      this.notificationCountService.decrementCount();
      window.location.href = payload.data?.url || INBOX_URL;
      notification.close();
    };

    if (!payload.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

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
                data: { url: INBOX_URL },
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

  startPeriodicNotificationCheck(intervalMinutes: number = 5): void {
    setInterval(() => {
      this.checkUnreadNotifications().subscribe();
    }, intervalMinutes * 60 * 1000);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

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

  isSupported(): boolean {
    return typeof navigator !== 'undefined'
      && typeof window !== 'undefined'
      && 'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window;
  }

  isSubscribed(): Observable<boolean> {
    return this.subscription$.pipe(
      switchMap(subscription => of(!!subscription))
    );
  }

  async subscribeAfterLogin(): Promise<PushSubscription | null> {
    if (Notification.permission === 'granted') {
      return this.ensureInstalledPwaPushSubscription();
    }
    const currentSubscription = this.subscriptionSubject.value;
    if (currentSubscription) {
      this.devLog('Already subscribed to push notifications');
      return currentSubscription;
    }
    return this.subscribeToPush();
  }

  async isUserLoggedIn(): Promise<boolean> {
    const userId = await firstValueFrom(this.getCurrentUserId());
    return !!(userId && userId > 0);
  }

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
