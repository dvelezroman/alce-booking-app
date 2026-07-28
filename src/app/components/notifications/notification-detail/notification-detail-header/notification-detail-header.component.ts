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
  selector: 'app-notification-detail-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './notification-detail-header.component.html',
  styleUrls: [
    './notification-detail-header.component.scss',
  ],
})
export class NotificationDetailHeaderComponent {

  @Input({ required: true })
  notification!: Notification;

  @Output()
  back = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }

}