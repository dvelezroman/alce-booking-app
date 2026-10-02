import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Notification } from '../../../services/dtos/notification.dto';

export type NotificationDeleteConfirmVariant = 'inbox' | 'detail';

@Component({
  selector: 'app-notification-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-delete-confirm-modal.component.html',
  styleUrl: './notification-delete-confirm-modal.component.scss',
})
export class NotificationDeleteConfirmModalComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() notifications: Notification[] = [];
  @Input() variant: NotificationDeleteConfirmVariant = 'inbox';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  readonly previewLimit = 4;

  get count(): number {
    return this.notifications.length;
  }

  get previewItems(): Notification[] {
    return this.notifications.slice(0, this.previewLimit);
  }

  get overflowCount(): number {
    return Math.max(0, this.count - this.previewLimit);
  }

  get eyebrowText(): string {
    return 'Acción irreversible';
  }

  get dialogTitle(): string {
    if (this.variant === 'detail') {
      return '¿Eliminar notificación?';
    }

    return '¿Eliminar de tu bandeja?';
  }

  get dialogDescription(): string {
    if (this.variant === 'detail') {
      return 'Esta acción no se puede deshacer. La notificación se eliminará de forma permanente.';
    }

    if (this.count === 1) {
      return '1 notificación seleccionada. Desaparecerá solo para ti; el resto de destinatarios no se ve afectado.';
    }

    return `${this.count} notificaciones seleccionadas. Desaparecerán solo para ti; el resto de destinatarios no se ve afectado.`;
  }

  get deleteButtonLabel(): string {
    if (this.loading) {
      return 'Eliminando…';
    }

    if (this.count === 1) {
      return 'Eliminar notificación';
    }

    return `Eliminar ${this.count} notificaciones`;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open || this.loading) {
      return;
    }

    this.cancel.emit();
  }

  onBackdropClick(): void {
    if (this.loading) {
      return;
    }

    this.cancel.emit();
  }

  onConfirmClick(): void {
    if (this.loading || this.count === 0) {
      return;
    }

    this.confirm.emit();
  }

  trackById(_index: number, notification: Notification): number {
    return notification.id;
  }

  displayTitle(notification: Notification): string {
    const title = notification.title?.trim();

    if (title) {
      return title;
    }

    return 'Sin título';
  }
}
