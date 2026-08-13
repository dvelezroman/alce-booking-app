import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  Notification,
} from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-notification-historial-table',
  standalone: true,
  imports: [],
  templateUrl: './notification-historial-table.component.html',
  styleUrl: './notification-historial-table.component.scss',
})
export class NotificationHistorialTableComponent {

  @Input() notifications: Notification[] = [];

  @Input() statusMap: Record<string, string> = {};
  @Input() typeMap: Record<string, string> = {};
  @Input() priorityMap: Record<number, string> = {};

  @Input() formatDate!: (
    dateStr?: string,
  ) => string;

  @Input() senderName!: (
    notification: Notification,
  ) => string;

  @Input() scopeLabel!: (
    notification: Notification,
  ) => string;

  @Output() rowClick =
    new EventEmitter<Notification>();

  onRowClick(
    notification: Notification,
  ): void {
    this.rowClick.emit(notification);
  }

  trackByNotificationId(
    index: number,
    notification: Notification,
  ): number {
    return notification.id ?? index;
  }
}