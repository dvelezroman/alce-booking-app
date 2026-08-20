import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-details',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notifications-details.component.html',
  styleUrl: './notifications-details.component.scss',
})
export class NotificationsDetailsComponent {

  @Input() isSupported = false;

  @Input()
  permission: NotificationPermission =
    'default';

  @Input() isSubscribed = false;


  get permissionTitle(): string {
    switch (this.permission) {
      case 'granted':
        return 'Permiso concedido';

      case 'denied':
        return 'Permiso denegado';

      default:
        return 'Aún no has concedido permiso';
    }
  }


  get permissionClass(): string {
    switch (this.permission) {
      case 'granted':
        return 'success';

      case 'denied':
        return 'danger';

      default:
        return 'warning';
    }
  }


  get subscriptionTitle(): string {
    return this.isSubscribed
      ? 'Tienes una suscripción activa'
      : 'No tienes una suscripción activa';
  }


  get preferenceTitle(): string {
    return this.isSubscribed
      ? 'Tienes las notificaciones habilitadas'
      : 'Tienes las notificaciones deshabilitadas';
  }
}