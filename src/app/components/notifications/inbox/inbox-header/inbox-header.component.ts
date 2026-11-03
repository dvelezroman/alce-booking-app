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
  /** Optional segment breakdown, e.g. "3 para mí · 2 acción · 10 avisos". */
  @Input() unreadBreakdownLabel = '';

  get unreadLabel(): string {
    if (this.unreadCount === 0) {
      return 'No tienes notificaciones nuevas';
    }

    const base =
      this.unreadCount === 1
        ? 'Tienes 1 notificación sin leer'
        : `Tienes ${this.unreadCount} notificaciones sin leer`;

    if (this.unreadBreakdownLabel) {
      return `${base} (${this.unreadBreakdownLabel})`;
    }

    return base;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }
}