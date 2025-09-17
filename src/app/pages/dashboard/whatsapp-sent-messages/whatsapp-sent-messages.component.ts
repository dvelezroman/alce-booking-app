import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { WhatsAppGroupService } from '../../../services/whatsapp-group.service';
import { MessageListComponent } from '../../../components/whatsapp/message-list/message-list.component';
import { GetWhatsAppMessagesFilters, GetWhatsAppMessagesResponse, WhatsAppMessage } from '../../../services/dtos/whatssapp-messages.dto';

@Component({
  selector: 'app-whatsapp-sent-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessageListComponent,
  ],
  templateUrl: './whatsapp-sent-messages.component.html',
  styleUrls: ['./whatsapp-sent-messages.component.scss'],
})
export class WhatsappSentMessagesComponent implements OnInit, OnDestroy {
  /** Estado */
  messages: WhatsAppMessage[] = [];
  totalMessages = 0;
  loading = false;
  error: string | null = null;

  /** Paginación */
  page = 1;
  limit = 20;

  /** Filtros */
  filters: GetWhatsAppMessagesFilters = {
    page: this.page,
    limit: this.limit,
    status: '',
    sentAtFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    sentAtTo: new Date().toISOString(), 
    recipientName: '',
  };

  /** RxJS para debounce */
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private whatsappSvc: WhatsAppGroupService) {}

  ngOnInit(): void {
    this.loadMessages();

    // Debounce búsqueda por nombre destinatario
    this.searchSubject
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.filters.recipientName = value;
        this.page = 1;
        this.filters.page = this.page;
        this.loadMessages();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Fetch */
  loadMessages(): void {
    this.loading = true;
    this.error = null;

    this.whatsappSvc.getMessages(this.filters).subscribe({
      next: (res: GetWhatsAppMessagesResponse) => {
        this.messages = res.messages;
        this.totalMessages = res.totalMessages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar mensajes:', err);
        this.error = 'No se pudieron cargar los mensajes.';
        this.loading = false;
      },
    });
  }

  /** Helpers de paginación */
  get startIndex(): number {
    return this.totalMessages === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.totalMessages ? this.totalMessages : end;
  }

  onPrev(): void {
    if (this.page > 1) {
      this.page--;
      this.filters.page = this.page;
      this.loadMessages();
    }
  }

  onNext(): void {
    if (this.page * this.limit < this.totalMessages) {
      this.page++;
      this.filters.page = this.page;
      this.loadMessages();
    }
  }

  onFiltersChange(): void {
    this.page = 1;
    this.filters.page = this.page;
    this.loadMessages();
  }

  /** Search con debounce */
  onRecipientSearch(value: string): void {
    this.searchSubject.next(value);
  }

  /** Contador filtros */
  get filteredCount(): number {
    if (this.filters.status === 'FAILED') {
      return this.messages.filter(m => m.status === 'FAILED').length;
    }

    if (this.filters.status) {
      return this.messages.filter(m => m.status === this.filters.status).length;
    }

    return this.messages.filter(m =>
      ['SENT', 'DELIVERED', 'READ', 'FAILED'].includes(m.status)
    ).length;
  }
}