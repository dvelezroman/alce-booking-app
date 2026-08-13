import {
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-notification-historial-header',
  standalone: true,
  imports: [],
  templateUrl: './notification-historial-header.component.html',
  styleUrl: './notification-historial-header.component.scss',
})
export class NotificationHistorialHeaderComponent {

  @Output() createNotification = new EventEmitter<void>();

  onCreateNotification(): void {
    this.createNotification.emit();
  }
}