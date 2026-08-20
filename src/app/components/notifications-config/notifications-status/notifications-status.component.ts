import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-status',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notifications-status.component.html',
  styleUrl: './notifications-status.component.scss',
})
export class NotificationsStatusComponent {

  @Input() isSupported = false;

  @Input()
  permission: NotificationPermission = 'default';

  @Input() isSubscribed = false;

  @Input() statusClass = '';

  @Input() statusText = 'No configurado';


  get supportText(): string {
    return this.isSupported
      ? 'Soportado'
      : 'No soportado';
  }


  get subscriptionText(): string {
    return this.isSubscribed
      ? 'Suscrito'
      : 'No suscrito';
  }


  get preferenceText(): string {
    return this.isSubscribed
      ? 'Habilitado'
      : 'Deshabilitado';
  }
}