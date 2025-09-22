import { Injectable } from '@angular/core';
import { PushNotificationService } from './push-notification.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationHelperService {

  constructor(private pushNotificationService: PushNotificationService) {}

  /**
   * Log only in development mode
   */
  private devLog(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(`[PushNotificationHelper] ${message}`, ...args);
    }
  }

  /**
   * Offer push notifications to user after login
   * Call this method after user successfully logs in
   */
  async offerPushNotifications(): Promise<void> {
    // Check if user is logged in
    const isLoggedIn = await this.pushNotificationService.isUserLoggedIn();
    if (!isLoggedIn) {
      this.devLog('User not logged in, skipping push notification offer');
      return;
    }

    // Check if push notifications are supported
    if (!this.pushNotificationService.isSupported()) {
      this.devLog('Push notifications not supported');
      return;
    }

    // Check if already subscribed
    const isSubscribed = await this.pushNotificationService.isSubscribed().toPromise();
    if (isSubscribed) {
      this.devLog('User already subscribed to push notifications');
      return;
    }

    // Check current permission
    const permission = await this.pushNotificationService.requestPermission();
    if (permission === 'granted') {
      // User granted permission, subscribe to push notifications
      const subscription = await this.pushNotificationService.subscribeToPush();
      if (subscription) {
        this.devLog('Successfully subscribed to push notifications');
        // You can show a success message to the user here
      }
    } else if (permission === 'denied') {
      this.devLog('User denied push notification permission');
      // You can show a message explaining how to enable notifications in browser settings
    } else {
      this.devLog('User dismissed push notification permission request');
    }
  }

  /**
   * Show push notification permission banner
   * This can be called from a component to show a custom banner
   */
  async showPermissionBanner(): Promise<boolean> {
    const isLoggedIn = await this.pushNotificationService.isUserLoggedIn();
    if (!isLoggedIn) {
      return false;
    }

    const isSubscribed = await this.pushNotificationService.isSubscribed().toPromise();
    if (isSubscribed) {
      return false;
    }

    return true; // Show banner
  }
}
