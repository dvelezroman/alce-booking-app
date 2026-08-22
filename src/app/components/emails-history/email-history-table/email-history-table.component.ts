import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  EmailMessage,
} from '../../../services/dtos/email.dto';

@Component({
  selector: 'app-email-history-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './email-history-table.component.html',
  styleUrl:
    './email-history-table.component.scss',
})
export class EmailHistoryTableComponent {

  @Input()
  emails: EmailMessage[] = [];

  @Input()
  loading = false;

  @Input()
  errorMsg = '';

  @Output()
  rowSelected =
    new EventEmitter<EmailMessage>();

  onRowClick(
    email: EmailMessage,
  ): void {
    this.rowSelected.emit(
      email,
    );
  }

  getStatusLabel(
    status: string,
  ): string {
    switch (status) {
      case 'SENT':
        return 'Enviado';

      case 'FAILED':
        return 'Fallido';

      case 'QUEUED':
        return 'En cola';

      default:
        return status;
    }
  }

  getRecipientTypeLabel(
    type: string,
  ): string {
    switch (type) {
      case 'INDIVIDUAL':
        return 'Individual';

      case 'GROUP':
        return 'Grupo';

      case 'STAGE':
        return 'Stage';

      case 'ROLE':
        return 'Rol';

      default:
        return type || '—';
    }
  }

  getRecipientLabel(
    email: EmailMessage,
  ): string {
    return (
      email.recipientName ||
      email.recipientEmail ||
      'Sin destinatario'
    );
  }

  getRecipientDetail(
    email: EmailMessage,
  ): string {
    if (
      email.recipientType ===
      'INDIVIDUAL'
    ) {
      return (
        email.recipientEmail ||
        'Sin email registrado'
      );
    }

    return `${email.quantity || 0} ${
      email.quantity === 1
        ? 'destinatario'
        : 'destinatarios'
    }`;
  }

  formatDate(
    value?: string,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(date);
  }

  getContentPreview(
    content: string,
  ): string {
    if (!content) {
      return 'Sin contenido';
    }

    const temp =
      document.createElement(
        'div',
      );

    temp.innerHTML =
      content;

    return (
      temp.textContent ||
      temp.innerText ||
      'Sin contenido'
    );
  }

  trackById(
    index: number,
    email: EmailMessage,
  ): number {
    return email.id;
  }
}