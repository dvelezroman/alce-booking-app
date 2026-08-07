import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  WhatsappCampaignOverallStatus,
  WhatsappCampaignSummary,
} from '../../../../services/dtos/whatsapp-notificador.dto';
import { WhatsAppNotificadorService } from '../../../../services/whatsapp-notificador.service';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';
import { formatToEcuadorTime } from '../../../../shared/utils/dates.util';

@Component({
  selector: 'app-whatsapp-campaign-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './whatsapp-campaign-history.component.html',
  styleUrl: './whatsapp-campaign-history.component.scss',
})
export class WhatsappCampaignHistoryComponent implements OnInit, OnDestroy {
  items: WhatsappCampaignSummary[] = [];
  total = 0;
  page = 1;
  limit = 20;
  loading = false;
  error: string | null = null;

  readonly limitOptions = [10, 20, 50] as const;

  readonly statusLabel: Record<WhatsappCampaignOverallStatus, string> = {
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completada',
    PARTIAL: 'Parcial',
    FAILED: 'Fallida',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly notificador: WhatsAppNotificadorService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return this.page < this.totalPages;
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.notificador
      .listCampaigns(this.page, this.limit)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.items = res.items;
          this.total = res.total;
          this.page = res.page;
          this.limit = res.limit;
        },
        error: (err) => {
          this.items = [];
          this.total = 0;
          this.error = getHttpErrorMessage(err, 'No se pudo cargar el historial.');
        },
      });
  }

  onLimitChange(): void {
    this.page = 1;
    this.load();
  }

  prevPage(): void {
    if (this.canPrev) {
      this.page--;
      this.load();
    }
  }

  nextPage(): void {
    if (this.canNext) {
      this.page++;
      this.load();
    }
  }

  formatDate(iso: string): string {
    return formatToEcuadorTime(iso);
  }

  statusClass(status: WhatsappCampaignOverallStatus): string {
    return `wa-campaign-badge--${status.toLowerCase().replace('_', '-')}`;
  }

  trackByBatchId(_index: number, row: WhatsappCampaignSummary): string {
    return row.batchId;
  }
}
