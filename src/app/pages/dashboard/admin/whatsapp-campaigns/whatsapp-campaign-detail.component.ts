import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, finalize, switchMap, takeUntil } from 'rxjs';
import {
  WhatsappCampaignDetail,
  WhatsappCampaignOverallStatus,
  WhatsappJobOutcome,
  WhatsappJobResultItem,
  WhatsappJobStatus,
  WhatsappJobStatusResponse,
} from '../../../../services/dtos/whatsapp-notificador.dto';
import { getJobOutcome } from '../../../../shared/utils/whatsapp-job.util';
import { WhatsAppNotificadorService } from '../../../../services/whatsapp-notificador.service';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';
import { formatToEcuadorTime } from '../../../../shared/utils/dates.util';

@Component({
  selector: 'app-whatsapp-campaign-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './whatsapp-campaign-detail.component.html',
  styleUrl: './whatsapp-campaign-detail.component.scss',
})
export class WhatsappCampaignDetailComponent implements OnInit, OnDestroy {
  campaign: WhatsappCampaignDetail | null = null;
  loading = false;
  error: string | null = null;

  expandedJobId: string | null = null;
  expandedJob: WhatsappJobStatusResponse | null = null;
  loadingJob = false;

  readonly statusLabel: Record<WhatsappCampaignOverallStatus, string> = {
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completada',
    PARTIAL: 'Parcial',
    FAILED: 'Fallida',
  };

  readonly jobStatusLabel: Record<WhatsappJobStatus, string> = {
    QUEUED: 'En cola',
    PROCESSING: 'Enviando',
    COMPLETED: 'Completado',
    PARTIAL: 'Parcial',
    FAILED: 'Fallido',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly notificador: WhatsAppNotificadorService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const batchId = params.get('batchId');
          if (!batchId) {
            throw new Error('Campaña no encontrada');
          }
          this.loading = true;
          this.error = null;
          this.campaign = null;
          this.expandedJobId = null;
          this.expandedJob = null;
          return this.notificador.getCampaign(batchId).pipe(
            finalize(() => (this.loading = false)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (detail) => {
          this.campaign = detail;
        },
        error: (err) => {
          this.error = getHttpErrorMessage(err, 'No se pudo cargar la campaña.');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canContinueCampaign(): boolean {
    return Boolean(this.campaign && this.campaign.remainingInBatch > 0);
  }

  formatDate(iso?: string): string {
    return iso ? formatToEcuadorTime(iso) : '—';
  }

  statusClass(status: WhatsappCampaignOverallStatus): string {
    return `wa-campaign-badge--${status.toLowerCase().replace('_', '-')}`;
  }

  jobBadgeClass(status: WhatsappJobStatus): string {
    if (status === 'COMPLETED') return 'wa-badge--ok';
    if (status === 'FAILED') return 'wa-badge--bad';
    if (status === 'PARTIAL') return 'wa-badge--warn';
    return 'wa-badge--muted';
  }

  expandedJobOutcomeLabel(job: WhatsappJobStatusResponse): string {
    const labels: Record<WhatsappJobOutcome, string> = {
      pending: 'En proceso',
      success: 'Completado',
      partial: 'Parcial',
      failed: 'Fallido',
    };
    return labels[getJobOutcome(job)];
  }

  expandedJobBadgeClass(job: WhatsappJobStatusResponse): string {
    const outcome = getJobOutcome(job);
    if (outcome === 'success') return 'wa-badge--ok';
    if (outcome === 'failed') return 'wa-badge--bad';
    if (outcome === 'partial') return 'wa-badge--warn';
    return 'wa-badge--muted';
  }

  toggleJobDetail(jobId: string): void {
    if (this.expandedJobId === jobId) {
      this.expandedJobId = null;
      this.expandedJob = null;
      return;
    }

    this.expandedJobId = jobId;
    this.expandedJob = null;
    this.loadingJob = true;
    this.notificador
      .getJob(jobId)
      .pipe(
        finalize(() => (this.loadingJob = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (job) => {
          this.expandedJob = job;
        },
        error: () => {
          this.expandedJob = null;
        },
      });
  }

  resultStatusLabel(status: string): string {
    const map: Record<string, string> = {
      sent: 'Enviado',
      failed: 'No enviado',
      skipped: 'Omitido',
    };
    return map[status] ?? status;
  }

  getResultDetail(row: WhatsappJobResultItem): string {
    if (row.status === 'failed') {
      return row.error?.trim() || 'Sin detalle del proveedor';
    }
    if (row.status === 'sent' && row.notificadorId) {
      return `ID ${row.notificadorId}`;
    }
    return '—';
  }

  copyBatchId(): void {
    if (!this.campaign) return;
    void navigator.clipboard?.writeText(this.campaign.batchId);
  }

  trackByJobId(_index: number, row: { jobId: string }): string {
    return row.jobId;
  }
}
