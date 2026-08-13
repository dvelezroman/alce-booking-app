import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  Notification as AppNotification,
} from '../../../../services/dtos/notification.dto';

import {
  sanitizeNotificationBody,
} from '../../../../shared/utils/notification-message.util';

@Component({
  selector: 'app-notification-sent-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notification-sent-table.component.html',
  styleUrl: './notification-sent-table.component.scss',
})
export class NotificationSentTableComponent {

  @Input() items: AppNotification[] = [];

  @Output() rowClick = new EventEmitter<AppNotification>();

  trackById(
    index: number,
    notification: AppNotification,
  ): number {
    return notification.id;
  }

  onRowClick(
    notification: AppNotification,
  ): void {
    this.rowClick.emit(notification);
  }

  notificationBodySnippet(
    body: string,
  ): string {
    return sanitizeNotificationBody(body);
  }

  formatNotificationDate(date: string): string {
  const value = new Date(date);

  return value.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

formatNotificationTime(date: string): string {
  const value = new Date(date);

  return value.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
}