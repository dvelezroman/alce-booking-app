import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications-config-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notifications-config-header.component.html',
  styleUrl: './notifications-config-header.component.scss',
})
export class NotificationsConfigHeaderComponent {

  @Input() isLoading = false;

  @Output() testNotificationRequested = new EventEmitter<void>();


  onTestNotification(): void {
    if (this.isLoading) return;

    this.testNotificationRequested.emit();
  }
}