import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notification-permission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-permission.component.html',
  styleUrls: ['./notification-permission.component.scss']
})
export class NotificationPermissionComponent implements OnInit, OnDestroy {
  showPermissionBanner = true;
  showSuccessMessage = false;
  isLoading = false;
  errorMessage: string | null = null;
  private subscriptions: Subscription[] = [];
  private readonly onSwMessage = (event: MessageEvent) => {
    if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
      void this.pushNotificationService.ensureInstalledPwaPushSubscription();
    }
  };

  constructor(private pushNotificationService: PushNotificationService) {}

  private devLog(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(`[NotificationPermission] ${message}`, ...args);
    }
  }

  ngOnInit() {
    if (!this.pushNotificationService.isSupported()) {
      this.showPermissionBanner = false;
      return;
    }

    window.addEventListener(
      'show-push-notification-banner',
      this.handleShowBannerEvent.bind(this) as EventListener
    );
    navigator.serviceWorker?.addEventListener('message', this.onSwMessage);

    this.subscriptions.push(
      this.pushNotificationService.permission$.subscribe(permission => {
        this.devLog('Permission status changed:', permission);
        if (permission === 'denied') {
          this.showPermissionBanner = false;
        }
      })
    );

    this.subscriptions.push(
      this.pushNotificationService.isSubscribed().subscribe(isSubscribed => {
        this.devLog('Subscription status changed:', isSubscribed);
        if (isSubscribed) {
          this.showPermissionBanner = false;
        }
      })
    );

    this.subscriptions.push(
      this.pushNotificationService.lastError$.subscribe(message => {
        this.errorMessage = message;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener(
      'show-push-notification-banner',
      this.handleShowBannerEvent.bind(this) as EventListener
    );
    navigator.serviceWorker?.removeEventListener('message', this.onSwMessage);
  }

  private handleShowBannerEvent(event: Event): void {
    const customEvent = event as CustomEvent;
    this.devLog('Received show banner event:', customEvent.detail);
    if (Notification.permission === 'denied') {
      return;
    }
    if (this.pushNotificationService.isBannerDismissed()) {
      return;
    }
    this.showPermissionBanner = true;
  }

  async enableNotifications() {
    this.isLoading = true;

    try {
      this.devLog('User clicked enable notifications');
      this.pushNotificationService.setPreferenceEnabled(true);
      const subscription = await this.pushNotificationService.subscribeToPush({
        ignorePreference: true,
      });

      if (subscription) {
        this.showPermissionBanner = false;
        this.showSuccessMessage = true;
        this.pushNotificationService.startPeriodicNotificationCheck(5);
        setTimeout(() => {
          this.dismissSuccess();
        }, 5000);
      }
    } catch (error) {
      console.error('Error al habilitar notificaciones:', error);
    } finally {
      this.isLoading = false;
    }
  }

  dismissBanner() {
    this.showPermissionBanner = false;
    this.pushNotificationService.dismissBanner();
  }

  dismissSuccess() {
    this.showSuccessMessage = false;
  }
}
