import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  EmailService,
} from '../../../../services/email.service';

import {
  EmailMessage,
  GetEmailMessagesQuery,
} from '../../../../services/dtos/email.dto';


interface SentEmailFilters {
  search: string;
  recipientType: string;
  recipientEmail: string;
  status: string;
  createdAtFrom: string;
  createdAtTo: string;
  sentAtFrom: string;
  sentAtTo: string;
}


@Component({
  selector: 'app-sent-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './sent-email.component.html',
  styleUrl: './sent-email.component.scss',
})
export class SentEmailComponent
  implements OnInit {

  /* =========================
     DATA
  ========================= */

  messages: EmailMessage[] = [];
  loading = false;

  totalMessages = 0;
  sentCount = 0;
  failedCount = 0;
  queuedCount = 0;


  /* =========================
     PAGINATION
  ========================= */

  page = 1;
  limit = 10;
  totalPages = 1;

  readonly limitOptions = [
    10,
    20,
    50,
  ];


  /* =========================
     FILTERS
  ========================= */

  filters: SentEmailFilters = {
    search: '',
    recipientType: '',
    recipientEmail: '',
    status: '',
    createdAtFrom: '',
    createdAtTo: '',
    sentAtFrom: '',
    sentAtTo: '',
  };


  /* =========================
     OPTIONS
  ========================= */

  readonly recipientTypeOptions = [
    {
      value: '',
      label: 'Todos',
    },
    {
      value: 'INDIVIDUAL',
      label: 'Individual',
    },
    {
      value: 'GROUP',
      label: 'Grupo',
    },
  ];

  readonly statusOptions = [
    {
      value: '',
      label: 'Todos',
    },
    {
      value: 'SENT',
      label: 'Enviado',
    },
    {
      value: 'FAILED',
      label: 'Fallido',
    },
    {
      value: 'QUEUED',
      label: 'En cola',
    },
  ];


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private emailService:
      EmailService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadMessages();
    this.loadStatistics();
  }


  /* =========================
     VISIBLE MESSAGES
  ========================= */

  get visibleMessages(): EmailMessage[] {

    const search =
      this.filters.search
        .trim()
        .toLowerCase();

    if (!search) {
      return this.messages;
    }

    return this.messages.filter(
      message => {

        const content =
          [
            message.id,
            message.messageId,
            message.recipientName,
            message.recipientEmail,
            message.subject,
            this.stripHtml(
              message.content,
            ),
          ]
            .join(' ')
            .toLowerCase();

        return content.includes(
          search,
        );
      },
    );
  }


  /* =========================
     RANGE
  ========================= */

  get startIndex(): number {

    if (
      this.totalMessages === 0
    ) {
      return 0;
    }

    return (
      (this.page - 1) *
      this.limit +
      1
    );
  }


  get endIndex(): number {

    return Math.min(
      this.page * this.limit,
      this.totalMessages,
    );
  }


  /* =========================
     LOAD
  ========================= */

  loadMessages(): void {

    this.loading = true;

    const query:
      GetEmailMessagesQuery = {

        page:
          this.page,

        limit:
          this.limit,

        recipientType:
          this.filters.recipientType ||
          undefined,

        recipientEmail:
          this.filters.recipientEmail
            .trim() ||
          undefined,

        status:
          this.filters.status ||
          undefined,

        createdAtFrom:
          this.filters.createdAtFrom ||
          undefined,

        createdAtTo:
          this.filters.createdAtTo ||
          undefined,

        sentAtFrom:
          this.filters.sentAtFrom ||
          undefined,

        sentAtTo:
          this.filters.sentAtTo ||
          undefined,
      };

    this.emailService
      .getEmailMessages(query)
      .subscribe({

        next: response => {

          this.messages =
            response.messages || [];

          this.totalMessages =
            response.totalMessages || 0;

          this.totalPages =
            Math.max(
              1,
              response.totalPages || 1,
            );

          this.loading = false;
        },

        error: error => {

          console.error(
            'Error al cargar emails enviados:',
            error,
          );

          this.messages = [];
          this.totalMessages = 0;
          this.totalPages = 1;
          this.loading = false;
        },
      });
  }


  /* =========================
     STATISTICS
  ========================= */

  private loadStatistics(): void {

    this.loadStatusCount(
      'SENT',
      value =>
        this.sentCount = value,
    );

    this.loadStatusCount(
      'FAILED',
      value =>
        this.failedCount = value,
    );

    this.loadStatusCount(
      'QUEUED',
      value =>
        this.queuedCount = value,
    );
  }


  private loadStatusCount(
    status: string,
    assign:
      (value: number) => void,
  ): void {

    this.emailService
      .getEmailMessages({
        page: 1,
        limit: 1,
        status,
      })
      .subscribe({

        next: response => {
          assign(
            response.totalMessages || 0,
          );
        },

        error: () => {
          assign(0);
        },
      });
  }


  /* =========================
     FILTER ACTIONS
  ========================= */

  applyFilters(): void {
    this.page = 1;
    this.loadMessages();
  }


  clearFilters(): void {

    this.filters = {
      search: '',
      recipientType: '',
      recipientEmail: '',
      status: '',
      createdAtFrom: '',
      createdAtTo: '',
      sentAtFrom: '',
      sentAtTo: '',
    };

    this.page = 1;

    this.loadMessages();
  }


  /* =========================
     LIMIT
  ========================= */

  onLimitChange(
    value: string,
  ): void {

    const limit =
      Number(value);

    if (
      !this.limitOptions.includes(
        limit,
      )
    ) {
      return;
    }

    this.limit = limit;
    this.page = 1;

    this.loadMessages();
  }


  /* =========================
     PAGINATION
  ========================= */

  previousPage(): void {

    if (
      this.page <= 1 ||
      this.loading
    ) {
      return;
    }

    this.page--;

    this.loadMessages();
  }


  nextPage(): void {

    if (
      this.page >=
        this.totalPages ||
      this.loading
    ) {
      return;
    }

    this.page++;

    this.loadMessages();
  }


  /* =========================
     RECIPIENT
  ========================= */

  getRecipientInitials(
    message: EmailMessage,
  ): string {

    const name =
      message.recipientName
        ?.trim();

    if (name) {

      const words =
        name.split(/\s+/);

      const initials =
        `${words[0]?.charAt(0) || ''}${
          words[1]?.charAt(0) || ''
        }`;

      if (initials) {
        return initials.toUpperCase();
      }
    }

    return (
      message.recipientEmail
        ?.charAt(0)
        ?.toUpperCase() ||
      'EM'
    );
  }


  getRecipientName(
    message: EmailMessage,
  ): string {

    return (
      message.recipientName ||
      message.recipientEmail ||
      'Destinatario'
    );
  }


  /* =========================
     LABELS
  ========================= */

  getStatusLabel(
    status: string,
  ): string {

    const labels:
      Record<string, string> = {
        SENT: 'Enviado',
        FAILED: 'Fallido',
        QUEUED: 'En cola',
      };

    return (
      labels[status] ||
      status ||
      '—'
    );
  }


  getRecipientTypeLabel(
    type: string,
  ): string {

    const labels:
      Record<string, string> = {
        INDIVIDUAL: 'Individual',
        GROUP: 'Grupo',
      };

    return (
      labels[type] ||
      type ||
      '—'
    );
  }


  /* =========================
     PREVIEW
  ========================= */

  getContentPreview(
    message: EmailMessage,
  ): string {

    return (
      this.stripHtml(
        message.content,
      ) ||
      'Sin contenido disponible.'
    );
  }


  /* =========================
     DATE
  ========================= */

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

    return date.toLocaleString(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }


  /* =========================
     PERCENTAGE
  ========================= */

  get sentPercentage(): number {

    if (
      this.totalMessages === 0
    ) {
      return 0;
    }

    return (
      this.sentCount /
      this.totalMessages
    ) * 100;
  }


  get failedPercentage(): number {

    if (
      this.totalMessages === 0
    ) {
      return 0;
    }

    return (
      this.failedCount /
      this.totalMessages
    ) * 100;
  }


  get queuedPercentage(): number {

    if (
      this.totalMessages === 0
    ) {
      return 0;
    }

    return (
      this.queuedCount /
      this.totalMessages
    ) * 100;
  }


  /* =========================
     HELPERS
  ========================= */

  private stripHtml(
    value: string,
  ): string {

    if (!value) {
      return '';
    }

    return value
      .replace(
        /<[^>]*>/g,
        ' ',
      )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim();
  }


  trackByMessageId(
    index: number,
    message: EmailMessage,
  ): number {

    return (
      message.id ??
      index
    );
  }
}