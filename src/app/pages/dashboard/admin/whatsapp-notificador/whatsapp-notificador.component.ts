import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import {
  EnqueueWhatsappResponse,
  PhoneValidationResult,
  ValidatePhonesResponse,
  WhatsappGateStatusResponse,
  WhatsappJobStatus,
  WhatsappJobStatusResponse,
} from '../../../../services/dtos/whatsapp-notificador.dto';
import { WhatsAppNotificadorService } from '../../../../services/whatsapp-notificador.service';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';

const MAX_PHONES_PER_SEND = 10;

@Component({
  selector: 'app-whatsapp-notificador',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './whatsapp-notificador.component.html',
  styleUrl: './whatsapp-notificador.component.scss',
})
export class WhatsappNotificadorComponent implements OnInit, OnDestroy {
  batchId = crypto.randomUUID();
  phonesRaw = '';
  contact = '';
  contentMessage = '';

  validation: ValidatePhonesResponse | null = null;
  gateStatus: WhatsappGateStatusResponse | null = null;
  lastEnqueue: EnqueueWhatsappResponse | null = null;
  currentJob: WhatsappJobStatusResponse | null = null;

  validating = false;
  sending = false;
  loadingStatus = false;
  error: string | null = null;
  cooldownLabel: string | null = null;

  modal: ModalDto = modalInitializer();

  readonly maxPhonesPerSend = MAX_PHONES_PER_SEND;

  readonly statusLabel: Record<WhatsappJobStatus, string> = {
    QUEUED: 'En cola',
    PROCESSING: 'Enviando',
    COMPLETED: 'Completado',
    PARTIAL: 'Parcial',
    FAILED: 'Fallido',
  };

  private readonly destroy$ = new Subject<void>();
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly notificador: WhatsAppNotificadorService) {}

  ngOnInit(): void {
    this.refreshGateStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearCooldownTimer();
  }

  get parsedPhones(): string[] {
    return this.parsePhones(this.phonesRaw);
  }

  get phonesOverLimit(): boolean {
    return this.parsedPhones.length > MAX_PHONES_PER_SEND;
  }

  get canValidate(): boolean {
    return this.parsedPhones.length > 0 && !this.validating && !this.sending;
  }

  get canSend(): boolean {
    if (this.sending || this.validating) {
      return false;
    }
    const phones = this.parsedPhones;
    if (phones.length < 1 || phones.length > MAX_PHONES_PER_SEND) {
      return false;
    }
    if (!this.validation?.allValid) {
      return false;
    }
    if (this.gateStatus?.remainingInBatch === 0) {
      return false;
    }
    if (this.currentJob && !this.currentJob.completed) {
      return false;
    }
    return Boolean(this.contact.trim() && this.contentMessage.trim());
  }

  get jobInProgress(): boolean {
    return Boolean(this.currentJob && !this.currentJob.completed);
  }

  get progressPercent(): number {
    if (!this.currentJob?.totalCount) {
      return 0;
    }
    return Math.min(
      100,
      Math.round((this.currentJob.sentCount / this.currentJob.totalCount) * 100),
    );
  }

  onPhonesChange(): void {
    this.validation = null;
    this.error = null;
  }

  onValidate(): void {
    const phones = this.parsedPhones;
    if (!phones.length) {
      this.error = 'Ingresa al menos un número de teléfono.';
      return;
    }
    if (phones.length > MAX_PHONES_PER_SEND) {
      this.error = `Máximo ${MAX_PHONES_PER_SEND} números por envío.`;
      return;
    }

    this.validating = true;
    this.error = null;
    this.notificador
      .validatePhones(phones)
      .pipe(
        finalize(() => (this.validating = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.validation = res;
        },
        error: (err) => {
          this.validation = null;
          this.error = getHttpErrorMessage(err, 'No se pudieron validar los teléfonos.');
        },
      });
  }

  onSend(): void {
    if (!this.canSend) {
      return;
    }

    const phones = this.parsedPhones;
    this.sending = true;
    this.error = null;
    this.currentJob = null;
    this.lastEnqueue = null;

    this.notificador
      .send({
        batchId: this.batchId,
        phones,
        contact: this.contact.trim(),
        contentMessage: this.contentMessage.trim(),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enqueued) => {
          this.lastEnqueue = enqueued;
          this.pollJob(enqueued.jobId);
        },
        error: (err) => {
          this.sending = false;
          this.error = this.formatSendError(err);
        },
      });
  }

  onNewCampaign(): void {
    if (this.jobInProgress) {
      return;
    }
    this.batchId = crypto.randomUUID();
    this.phonesRaw = '';
    this.contact = '';
    this.contentMessage = '';
    this.validation = null;
    this.lastEnqueue = null;
    this.currentJob = null;
    this.error = null;
    this.refreshGateStatus();
  }

  refreshGateStatus(): void {
    this.loadingStatus = true;
    this.notificador
      .getStatus(this.batchId)
      .pipe(
        finalize(() => (this.loadingStatus = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (status) => {
          this.gateStatus = status;
          this.updateCooldownLabel();
        },
        error: () => {
          this.gateStatus = null;
          this.cooldownLabel = null;
        },
      });
  }

  trackByPhone(_index: number, row: PhoneValidationResult): string {
    return row.phone;
  }

  trackByResultPhone(_index: number, row: { phone: string }): string {
    return row.phone;
  }

  private pollJob(jobId: string): void {
    this.notificador
      .pollJobUntilComplete(jobId)
      .pipe(
        finalize(() => (this.sending = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (job) => {
          this.currentJob = job;
        },
        error: (err) => {
          const msg =
            err instanceof Error
              ? err.message
              : getHttpErrorMessage(err, 'Error al consultar el estado del envío.');
          this.error = msg;
          this.showModal(msg, true);
        },
        complete: () => {
          this.refreshGateStatus();
          if (this.currentJob?.success) {
            this.showModal(
              `Envío completado: ${this.currentJob.sentCount} de ${this.currentJob.totalCount} mensaje(s).`,
              false,
              true,
            );
          } else if (this.currentJob) {
            const detail =
              this.currentJob.errorMessage ||
              'Algunos mensajes no se enviaron. Revisa el detalle por número.';
            this.showModal(detail, true);
          }
        },
      });
  }

  private parsePhones(raw: string): string[] {
    return raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private formatSendError(err: unknown): string {
    const base = getHttpErrorMessage(err, 'No se pudo encolar el envío.');
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: unknown }).error;
      if (body && typeof body === 'object' && 'invalidPhones' in body) {
        const invalid = (body as { invalidPhones?: unknown }).invalidPhones;
        if (Array.isArray(invalid) && invalid.length) {
          return `${base}\n${invalid.map(String).join('\n')}`;
        }
      }
    }
    return base;
  }

  private updateCooldownLabel(): void {
    this.clearCooldownTimer();
    if (!this.gateStatus || this.gateStatus.canSend || !this.gateStatus.nextAvailableAt) {
      this.cooldownLabel = null;
      return;
    }

    const tick = () => {
      const remaining = new Date(this.gateStatus!.nextAvailableAt!).getTime() - Date.now();
      if (remaining <= 0) {
        this.cooldownLabel = null;
        this.clearCooldownTimer();
        this.refreshGateStatus();
        return;
      }
      const sec = Math.ceil(remaining / 1000);
      const min = Math.floor(sec / 60);
      const rest = sec % 60;
      this.cooldownLabel =
        min > 0 ? `${min} min ${rest} s` : `${rest} s`;
    };

    tick();
    this.cooldownTimer = setInterval(tick, 1000);
  }

  private clearCooldownTimer(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  private showModal(message: string, isError: boolean, isSuccess = false): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => (this.modal.show = false),
    };
  }
}
