import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Notification,
} from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-notification-detail-info',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './notification-detail-info.component.html',
  styleUrls: [
    './notification-detail-info.component.scss',
  ],
})
export class NotificationDetailInfoComponent {

  @Input({ required: true })
  notification!: Notification;

  @Input()
  estadoLabel = '';

  @Input()
  tipoLabel = '';

  @Input()
  prioridadLabel = '';

  @Input()
  toDisplayName = '';

  isExpanded = false;
  
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;

  }

  get createdAt(): Date | null {
    const value = this.notification?.createdAt;

    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  get statusClass(): string {
    const status =
      this.estadoLabel
        .trim()
        .toLowerCase();

    if (
      status.includes('leída') ||
      status.includes('leida') ||
      status.includes('completada') ||
      status.includes('enviada')
    ) {
      return 'notification-detail-info__badge--success';
    }

    if (
      status.includes('pendiente') ||
      status.includes('no leída') ||
      status.includes('no leida')
    ) {
      return 'notification-detail-info__badge--warning';
    }

    if (
      status.includes('cancelada') ||
      status.includes('rechazada') ||
      status.includes('error')
    ) {
      return 'notification-detail-info__badge--danger';
    }

    return 'notification-detail-info__badge--neutral';
  }

  get priorityClass(): string {
    const priority =
      this.prioridadLabel
        .trim()
        .toLowerCase();

    if (
      priority.includes('alta') ||
      priority.includes('urgente')
    ) {
      return 'notification-detail-info__badge--danger';
    }

    if (
      priority.includes('media')
    ) {
      return 'notification-detail-info__badge--warning';
    }

    if (
      priority.includes('baja')
    ) {
      return 'notification-detail-info__badge--success';
    }

    return 'notification-detail-info__badge--neutral';
  }

  get recipientLabel(): string {
    return this.toDisplayName.trim() ||
      'No especificado';
  }

  get typeLabel(): string {
    return this.tipoLabel.trim() ||
      'Notificación';
  }

  get stateLabel(): string {
    return this.estadoLabel.trim() ||
      'Sin estado';
  }

  get priorityLabel(): string {
    return this.prioridadLabel.trim() ||
      'Normal';
  }
}