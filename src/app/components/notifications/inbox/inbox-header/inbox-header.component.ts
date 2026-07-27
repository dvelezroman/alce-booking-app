import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-inbox-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './inbox-header.component.html',
  styleUrl: './inbox-header.component.scss',
})
export class InboxHeaderComponent {
  @Input() unreadCount = 0;

  get unreadLabel(): string {
    if (this.unreadCount === 0) {
      return 'No tienes notificaciones nuevas';
    }

    if (this.unreadCount === 1) {
      return 'Tienes 1 notificación sin leer';
    }

    return `Tienes ${this.unreadCount} notificaciones sin leer`;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }
}