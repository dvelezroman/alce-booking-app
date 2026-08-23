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


interface EmailFilters {
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
  selector: 'app-inbox-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './inbox-email.component.html',
  styleUrl: './inbox-email.component.scss',
})
export class InboxEmailComponent
  implements OnInit {

  /* =========================
     DATA
  ========================= */

  messages: EmailMessage[] = [];
  selectedMessageIds: number[] = [];

  totalMessages = 0;

  sentCount = 0;
  failedCount = 0;
  queuedCount = 0;

  loading = false;


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
     FILTER OPTIONS
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
     FILTERS
  ========================= */

  filters: EmailFilters = {
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
    this.loadStatusCounters();
  }


  /* =========================
     FILTERED PAGE
  ========================= */

  get visibleMessages(): EmailMessage[] {

    const term =
      this.filters.search
        .trim()
        .toLowerCase();

    if (!term) {
      return this.messages;
    }

    return this.messages.filter(
      message => {

        const searchable =
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

        return searchable.includes(
          term,
        );
      },
    );
  }


  /* =========================
     PAGINATION GETTERS
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
     SELECTION
  ========================= */

  get allSelected(): boolean {

    if (
      this.visibleMessages.length === 0
    ) {
      return false;
    }

    return this.visibleMessages.every(
      message =>
        this.selectedMessageIds.includes(
          message.id,
        ),
    );
  }


  get someSelected(): boolean {

    if (this.allSelected) {
      return false;
    }

    return this.visibleMessages.some(
      message =>
        this.selectedMessageIds.includes(
          message.id,
        ),
    );
  }


  toggleMessage(
    id: number,
  ): void {

    if (
      this.selectedMessageIds.includes(
        id,
      )
    ) {

      this.selectedMessageIds =
        this.selectedMessageIds.filter(
          selectedId =>
            selectedId !== id,
        );

      return;
    }

    this.selectedMessageIds = [
      ...this.selectedMessageIds,
      id,
    ];
  }


  toggleAll(
    checked: boolean,
  ): void {

    if (!checked) {

      this.selectedMessageIds = [];

      return;
    }

    this.selectedMessageIds =
      this.visibleMessages.map(
        message =>
          message.id,
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

          this.selectedMessageIds = [];

          this.loading = false;
        },

        error: error => {

          console.error(
            'Error al obtener mensajes de email:',
            error,
          );

          this.messages = [];
          this.totalMessages = 0;
          this.totalPages = 1;
          this.selectedMessageIds = [];

          this.loading = false;
        },
      });
  }


  /* =========================
     STATUS COUNTERS
  ========================= */

  private loadStatusCounters(): void {

    this.loadCounter(
      'SENT',
      value =>
        this.sentCount = value,
    );

    this.loadCounter(
      'FAILED',
      value =>
        this.failedCount = value,
    );

    this.loadCounter(
      'QUEUED',
      value =>
        this.queuedCount = value,
    );
  }


  private loadCounter(
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

        next: response =>
          assign(
            response.totalMessages || 0,
          ),

        error: () =>
          assign(0),
      });
  }


  /* =========================
     SEARCH / FILTER
  ========================= */

  onSearch(): void {

    this.page = 1;

    this.loadMessages();
  }


  onFilterChange(): void {

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
     PAGINATION
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


  previousPage(): void {

    if (
      this.page <= 1
    ) {
      return;
    }

    this.page--;

    this.loadMessages();
  }


  nextPage(): void {

    if (
      this.page >=
      this.totalPages
    ) {
      return;
    }

    this.page++;

    this.loadMessages();
  }


  /* =========================
     FORMAT
  ========================= */

  getRecipientInitials(
    message: EmailMessage,
  ): string {

    const name =
      message.recipientName
        ?.trim();

    if (name) {

      const parts =
        name.split(/\s+/);

      return (
        `${parts[0]?.charAt(0) || ''}${
          parts[1]?.charAt(0) || ''
        }`
      )
        .toUpperCase() ||
        'EM';
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


  getContentPreview(
    message: EmailMessage,
  ): string {

    const text =
      this.stripHtml(
        message.content,
      );

    return (
      text ||
      'Sin contenido disponible.'
    );
  }


  getTypeLabel(
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