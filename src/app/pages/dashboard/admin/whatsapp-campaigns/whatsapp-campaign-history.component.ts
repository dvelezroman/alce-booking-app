import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  Subject,
  finalize,
  takeUntil,
} from 'rxjs';

import {
  WhatsappCampaignOverallStatus,
  WhatsappCampaignSummary,
} from '../../../../services/dtos/whatsapp-notificador.dto';

import {
  WhatsAppNotificadorService,
} from '../../../../services/whatsapp-notificador.service';

import {
  getHttpErrorMessage,
} from '../../../../shared/utils/http-error-message.util';

import {
  formatToEcuadorTime,
} from '../../../../shared/utils/dates.util';

@Component({
  selector: 'app-whatsapp-campaign-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './whatsapp-campaign-history.component.html',
  styleUrl: './whatsapp-campaign-history.component.scss',
})
export class WhatsappCampaignHistoryComponent
  implements OnInit, OnDestroy {

  /* =========================
     DATA
  ========================= */

  items: WhatsappCampaignSummary[] = [];

  total = 0;
  page = 1;
  limit = 20;

  loading = false;

  error: string | null = null;


  /* =========================
     OPTIONS
  ========================= */

  readonly limitOptions = [
    10,
    20,
    50,
  ] as const;


  /* =========================
     STATUS
  ========================= */

  readonly statusLabel:
    Record<
      WhatsappCampaignOverallStatus,
      string
    > = {
      IN_PROGRESS: 'En curso',
      COMPLETED: 'Completada',
      PARTIAL: 'Parcial',
      FAILED: 'Fallida',
    };


  /* =========================
     DESTROY
  ========================= */

  private readonly destroy$ =
    new Subject<void>();


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private readonly notificador:
      WhatsAppNotificadorService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.load();
  }


  /* =========================
     DESTROY
  ========================= */

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /* =========================
     PAGINATION
  ========================= */

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit,
      ),
    );
  }

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  /* =========================
     NEW SUMMARY GETTERS
  ========================= */

  get totalSentCount(): number {
    return this.items.reduce(
      (
        totalSent,
        item,
      ) =>
        totalSent +
        item.totalSent,
      0,
    );
  }

  get totalFailedCount(): number {
    return this.items.reduce(
      (
        totalFailed,
        item,
      ) =>
        totalFailed +
        item.totalFailed,
      0,
    );
  }

  get inProgressCount(): number {
    return this.items.filter(
      item =>
        item.overallStatus ===
        'IN_PROGRESS',
    ).length;
  }


  /* =========================
     PAGINATION RANGE
  ========================= */

  get paginationStart(): number {
    if (!this.total) {
      return 0;
    }

    return (
      (
        this.page -
        1
      ) *
      this.limit
    ) + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.page *
        this.limit,
      this.total,
    );
  }


  /* =========================
     LOAD
  ========================= */

  load(): void {
    this.loading = true;
    this.error = null;

    this.notificador
      .listCampaigns(
        this.page,
        this.limit,
      )
      .pipe(
        finalize(
          () =>
            (
              this.loading =
                false
            ),
        ),
        takeUntil(
          this.destroy$,
        ),
      )
      .subscribe({
        next: (res) => {
          this.items =
            res.items;

          this.total =
            res.total;

          this.page =
            res.page;

          this.limit =
            res.limit;
        },

        error: (err) => {
          this.items = [];

          this.total = 0;

          this.error =
            getHttpErrorMessage(
              err,
              'No se pudo cargar el historial.',
            );
        },
      });
  }


  /* =========================
     LIMIT
  ========================= */

  onLimitChange(): void {
    this.page = 1;

    this.load();
  }


  /* =========================
     PREVIOUS
  ========================= */

  prevPage(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;

    this.load();
  }


  /* =========================
     NEXT
  ========================= */

  nextPage(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;

    this.load();
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    iso: string,
  ): string {
    return formatToEcuadorTime(
      iso,
    );
  }


  /* =========================
     STATUS CLASS
  ========================= */

  statusClass(
    status:
      WhatsappCampaignOverallStatus,
  ): string {
    return (
      `wa-campaign-badge--${
        status
          .toLowerCase()
          .replace(
            '_',
            '-',
          )
      }`
    );
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByBatchId(
    _index: number,
    row: WhatsappCampaignSummary,
  ): string {
    return row.batchId;
  }
}