import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-notification-sent-header',
  standalone: true,
  imports: [],
  templateUrl: './notification-sent-header.component.html',
  styleUrl: './notification-sent-header.component.scss',
})
export class NotificationSentHeaderComponent {

  @Output() createNotification = new EventEmitter<void>();

  onCreateNotification(): void {
    this.createNotification.emit();
  }
}