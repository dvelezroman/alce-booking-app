import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Notification,
} from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-notification-detail-actions',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './notification-detail-actions.component.html',
  styleUrls: [
    './notification-detail-actions.component.scss',
  ],
})
export class NotificationDetailActionsComponent {

  @Input({ required: true })
  notification!: Notification;

  @Input()
  deleting = false;

  @Output()
  back =
    new EventEmitter<void>();

  @Output()
  delete =
    new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }

  onDelete(): void {
    if (this.deleting) {
      return;
    }

    this.delete.emit();
  }
}