import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';

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

  ngOnInit() {
    // Verificar si las notificaciones están soportadas
    if (!this.pushNotificationService.isSupported()) {
      return;
    }

    // Estado del permiso
    this.subscriptions.push(
      this.pushNotificationService.permission$.subscribe(permission => {
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
        if (isSubscribed) {
          this.showPermissionBanner = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async enableNotifications() {
    this.isLoading = true;

    try {
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
        console.warn('No se pudo suscribir a notificaciones push');
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