import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-notification-permission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-permission.component.html',
  styleUrls: ['./notification-permission.component.scss']
})
export class NotificationPermissionComponent implements OnInit, OnDestroy {
  showPermissionBanner = false;
  showSuccessMessage = false;
  isLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(private pushNotificationService: PushNotificationService) {}

  /**
   * Log only in development mode
   */
  private devLog(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(`[NotificationPermission] ${message}`, ...args);
    }
  }

  ngOnInit() {
    // Verificar si las notificaciones están soportadas
    if (!this.pushNotificationService.isSupported()) {
      return;
    }

    // Listen for custom event to show banner after login
    window.addEventListener('show-push-notification-banner', this.handleShowBannerEvent.bind(this));

    // Estado del permiso
    this.subscriptions.push(
      this.pushNotificationService.permission$.subscribe(permission => {
        this.devLog('Permission status changed:', permission);
        if (permission === 'default') {
          this.showPermissionBanner = true;
        } else if (permission === 'granted') {
          this.showPermissionBanner = false;
        }
      })
    );

    // Estado de suscripción
    this.subscriptions.push(
      this.pushNotificationService.isSubscribed().subscribe(isSubscribed => {
        this.devLog('Subscription status changed:', isSubscribed);
        if (isSubscribed) {
          this.showPermissionBanner = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('show-push-notification-banner', this.handleShowBannerEvent.bind(this));
  }

  /**
   * Handle the custom event to show push notification banner
   */
  private handleShowBannerEvent(event: CustomEvent): void {
    this.devLog('Received show banner event:', event.detail);
    this.showPermissionBanner = true;
  }

  async enableNotifications() {
    this.isLoading = true;

    try {
      this.devLog('User clicked enable notifications');
      const subscription = await this.pushNotificationService.subscribeToPush();

      if (subscription) {
        this.showPermissionBanner = false;
        this.showSuccessMessage = true;

        // Inicia chequeo periódico
        this.pushNotificationService.startPeriodicNotificationCheck(5);

        // Ocultar mensaje de éxito tras 5s
        setTimeout(() => {
          this.dismissSuccess();
        }, 5000);
      } else {
        this.devLog('No se pudo suscribir a notificaciones push');
      }
    } catch (error) {
      console.error('Error al habilitar notificaciones:', error);
    } finally {
      this.isLoading = false;
    }
  }

  dismissBanner() {
    this.showPermissionBanner = false;
    localStorage.setItem('notification-permission-dismissed', Date.now().toString());
  }

  dismissSuccess() {
    this.showSuccessMessage = false;
  }
}