import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Notification } from '../../../../../../src/app/services/dtos/notification.dto';

import { NotificationCardComponent } from '../notification-card/notification-card.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    NotificationCardComponent,
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
    notification: Notification
  ): void {
    this.notificationSelected.emit(notification);
  }

  trackByNotificationId(
    index: number,
    notification: Notification
  ): string | number {
    return notification.id ?? index;
  }
}