import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Notification } from '../../../../../../src/app/services/dtos/notification.dto';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent {

  @Input() notifications: Notification[] = [];

  @Output()
  notificationSelected =
    new EventEmitter<Notification>();

  onNotificationClick(
    notification: Notification,
  ): void {
    this.notificationSelected.emit(notification);
  }

  trackByNotificationId(
    index: number,
    notification: Notification,
  ): string | number {
    return notification.id ?? index;
  }

  getNotificationTypeLabel(
    notification: Notification,
  ): string {
    const labels: Record<string, string> = {
      Announce: 'Anuncio',
      Advice: 'Aviso',
      Commentary: 'Comentario',
      Mandatory: 'Obligatorio',
      System: 'Sistema',
      Meeting: 'Clase',
      Assessment: 'Evaluación',
    };

    return (
      labels[notification.notificationType] ||
      notification.notificationType
    );
  }

  getScopeLabel(
    notification: Notification,
  ): string {
    switch (notification.scope) {
      case 'INDIVIDUAL':
        return 'Individual';

      case 'ALL_USERS':
        return 'Todos los usuarios';

      case 'ALL_STUDENTS':
        return 'Todos los estudiantes';

      case 'ALL_INSTRUCTORS':
        return 'Todos los instructores';

      case 'STAGE_STUDENTS':
        return notification.stage?.number
          ? `Etapa ${notification.stage.number}`
          : 'Estudiantes por etapa';

      default:
        return '—';
    }
  }

  getScopeCountLabel(
    notification: Notification,
  ): string {
    if (
      notification.scope === 'INDIVIDUAL'
    ) {
      return '';
    }

    const count =
      notification.to?.length || 0;

    if (!count) {
      return '';
    }

    switch (notification.scope) {
      case 'ALL_INSTRUCTORS':
        return `${count} instructores`;

      case 'ALL_USERS':
        return `${count} usuarios`;

      default:
        return `${count} estudiantes`;
    }
  }

  getSenderName(
    notification: Notification,
  ): string {
    const firstName =
      notification.fromUser?.firstName?.trim() ||
      '';

    const lastName =
      notification.fromUser?.lastName?.trim() ||
      '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return (
      fullName ||
      notification.fromUser?.email ||
      'Sistema'
    );
  }

  getSenderInitials(
    notification: Notification,
  ): string {
    const firstName =
      notification.fromUser?.firstName?.trim() ||
      '';

    const lastName =
      notification.fromUser?.lastName?.trim() ||
      '';

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
      initials ||
      this.getSenderName(notification).charAt(0) ||
      'S'
    ).toUpperCase();
  }

  getPriorityLabel(
    notification: Notification,
  ): string {
    switch (notification.priority) {
      case 0:
        return 'Baja';

      case 1:
        return 'Normal';

      case 2:
        return 'Alta';

      case 3:
        return 'Urgente';

      default:
        return 'Normal';
    }
  }

  getStatusLabel(
    notification: Notification,
  ): string {
    const labels: Record<string, string> = {
      SENT: 'Enviado',
      PENDING: 'Pendiente',
      DELIVERED: 'Entregado',
      READ: 'Leído',
      FAILED: 'Fallido',
    };

    return (
      labels[notification.status] ||
      notification.status
    );
  }

  formatDate(
    notification: Notification,
  ): string {
    const value =
      notification.sentAt ||
      notification.scheduledAt ||
      notification.createdAt;

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  }

  formatTime(
    notification: Notification,
  ): string {
    const value =
      notification.sentAt ||
      notification.scheduledAt ||
      notification.createdAt;

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );
  }
}