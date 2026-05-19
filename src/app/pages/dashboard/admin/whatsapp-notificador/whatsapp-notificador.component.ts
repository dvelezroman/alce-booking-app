import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, concatMap, finalize, from, takeUntil, tap } from 'rxjs';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { UserSelectorComponent } from '../../../../components/notifications/user-selector/user-selector.component';
import {
  EnqueueWhatsappResponse,
  PhoneValidationResult,
  ValidatePhonesResponse,
  WhatsappGateStatusResponse,
  WhatsappJobStatus,
  WhatsappJobStatusResponse,
  WhatsappSendDisplayResult,
} from '../../../../services/dtos/whatsapp-notificador.dto';
import { UserDto } from '../../../../services/dtos/user.dto';
import { WhatsappContentTemplate } from '../../../../services/dtos/whatsapp-content-template.dto';
import { WhatsappContentTemplateService } from '../../../../services/whatsapp-content-template.service';
import { WhatsAppNotificadorService } from '../../../../services/whatsapp-notificador.service';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';
import {
  StudentRecipient,
  getStudentDisplayContact,
  mapStudentToRecipient,
} from '../../../../shared/utils/whatsapp-phone.util';

const MAX_PHONES_PER_SEND = 10;

@Component({
  selector: 'app-whatsapp-notificador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent, UserSelectorComponent],
  templateUrl: './whatsapp-notificador.component.html',
  styleUrl: './whatsapp-notificador.component.scss',
})
export class WhatsappNotificadorComponent implements OnInit, OnDestroy {
  batchId: string = crypto.randomUUID();
  contact = '';
  contentMessage = '';

  selectedRecipients: StudentRecipient[] = [];
  selectorResetTrigger = 0;

  validation: ValidatePhonesResponse | null = null;
  gateStatus: WhatsappGateStatusResponse | null = null;
  lastEnqueue: EnqueueWhatsappResponse | null = null;
  currentJob: WhatsappJobStatusResponse | null = null;
  /** Resultados acumulados por destinatario (envío secuencial). */
  sendResults: WhatsappSendDisplayResult[] = [];

  templates: WhatsappContentTemplate[] = [];
  selectedTemplateId: number | null = null;
  loadingTemplates = false;
  savingTemplate = false;
  newTemplateName = '';
  showSaveTemplateForm = false;

  validating = false;
  sending = false;
  loadingStatus = false;
  error: string | null = null;
  cooldownLabel: string | null = null;

  sendProgressIndex = 0;
  sendProgressTotal = 0;

  modal: ModalDto = modalInitializer();

  readonly maxPhonesPerSend = MAX_PHONES_PER_SEND;

  /** Guía de uso visible por defecto; el usuario puede ocultarla. */
  helpExpanded = true;

  /** true si se reanudó una campaña vía ?batchId= */
  resumedCampaign = false;

  readonly statusLabel: Record<WhatsappJobStatus, string> = {
    QUEUED: 'En cola',
    PROCESSING: 'Enviando',
    COMPLETED: 'Completado',
    PARTIAL: 'Parcial',
    FAILED: 'Fallido',
  };

  private readonly destroy$ = new Subject<void>();
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;
  private modalDismissTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly notificador: WhatsAppNotificadorService,
    private readonly contentTemplates: WhatsappContentTemplateService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const batchFromQuery = this.route.snapshot.queryParamMap.get('batchId');
    if (batchFromQuery?.trim()) {
      this.batchId = batchFromQuery.trim();
      this.resumedCampaign = true;
    }
    this.refreshGateStatus();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearCooldownTimer();
    this.clearModalDismissTimer();
  }

  get validRecipients(): StudentRecipient[] {
    return this.selectedRecipients.filter((r) => r.phone);
  }

  get parsedPhones(): string[] {
    return this.validRecipients
      .map((r) => r.phone)
      .filter((p): p is string => Boolean(p));
  }

  get showSingleContactField(): boolean {
    return this.validRecipients.length === 1;
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
    if (this.jobInProgress) {
      return false;
    }
    if (!this.contentMessage.trim()) {
      return false;
    }
    if (this.showSingleContactField && !this.contact.trim()) {
      return false;
    }
    return true;
  }

  get jobInProgress(): boolean {
    return Boolean(this.currentJob && !this.currentJob.completed);
  }

  get bulkSendInProgress(): boolean {
    return this.sending && this.sendProgressTotal > 1;
  }

  get displaySendResults(): WhatsappSendDisplayResult[] {
    if (this.sendResults.length > 0) {
      return this.sendResults;
    }
    return (this.currentJob?.results ?? []).map((row) => ({ ...row }));
  }

  get aggregatedSentCount(): number {
    if (this.sendResults.length > 0) {
      return this.sendResults.filter((r) => r.status === 'sent').length;
    }
    return this.currentJob?.sentCount ?? 0;
  }

  get aggregatedFailedCount(): number {
    if (this.sendResults.length > 0) {
      return this.sendResults.filter((r) => r.status === 'failed').length;
    }
    return this.currentJob?.failedCount ?? 0;
  }

  get progressPercent(): number {
    if (this.bulkSendInProgress && this.sendProgressTotal > 0) {
      return Math.round((this.sendProgressIndex / this.sendProgressTotal) * 100);
    }
    if (!this.currentJob?.totalCount) {
      return 0;
    }
    return Math.min(
      100,
      Math.round((this.currentJob.sentCount / this.currentJob.totalCount) * 100),
    );
  }

  get selectedTemplate(): WhatsappContentTemplate | null {
    if (this.selectedTemplateId == null) {
      return null;
    }
    return this.templates.find((t) => t.id === this.selectedTemplateId) ?? null;
  }

  onStudentsSelected(users: UserDto[]): void {
    this.selectedRecipients = users.map(mapStudentToRecipient);
    this.validation = null;
    this.error = null;

    if (users.length === 1) {
      this.contact = getStudentDisplayContact(users[0]);
    } else if (users.length !== 1) {
      this.contact = '';
    }
  }

  onContentMessageChange(): void {
    this.validation = null;
  }

  onTemplateSelect(templateId: number | null): void {
    this.selectedTemplateId = templateId;
    const template = this.templates.find((t) => t.id === templateId);
    if (template) {
      this.contentMessage = template.body;
      this.validation = null;
    }
  }

  loadTemplates(): void {
    this.loadingTemplates = true;
    this.contentTemplates
      .list()
      .pipe(
        finalize(() => (this.loadingTemplates = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (list) => {
          this.templates = list;
        },
        error: () => {
          this.templates = [];
        },
      });
  }

  openSaveTemplateForm(): void {
    if (!this.contentMessage.trim()) {
      this.error = 'Escribe un mensaje antes de guardar la plantilla.';
      return;
    }
    this.newTemplateName = this.selectedTemplate?.name ?? '';
    this.showSaveTemplateForm = true;
  }

  cancelSaveTemplateForm(): void {
    this.showSaveTemplateForm = false;
    this.newTemplateName = '';
  }

  saveNewTemplate(): void {
    const name = this.newTemplateName.trim();
    const body = this.contentMessage.trim();
    if (!name || !body) {
      this.error = 'Nombre y mensaje son obligatorios para la plantilla.';
      return;
    }

    this.savingTemplate = true;
    this.contentTemplates
      .create({ name, body })
      .pipe(
        finalize(() => (this.savingTemplate = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (created) => {
          this.templates = [created, ...this.templates];
          this.selectedTemplateId = created.id;
          this.showSaveTemplateForm = false;
          this.newTemplateName = '';
          this.showModal('Plantilla guardada.', false, true);
        },
        error: (err) => {
          this.error = getHttpErrorMessage(err, 'No se pudo guardar la plantilla.');
        },
      });
  }

  updateSelectedTemplate(): void {
    const template = this.selectedTemplate;
    if (!template) {
      return;
    }
    const body = this.contentMessage.trim();
    if (!body) {
      this.error = 'El mensaje no puede estar vacío.';
      return;
    }

    this.savingTemplate = true;
    this.contentTemplates
      .update(template.id, { name: template.name, body })
      .pipe(
        finalize(() => (this.savingTemplate = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (updated) => {
          this.templates = this.templates.map((t) =>
            t.id === updated.id ? updated : t,
          );
          this.showModal('Plantilla actualizada.', false, true);
        },
        error: (err) => {
          this.error = getHttpErrorMessage(err, 'No se pudo actualizar la plantilla.');
        },
      });
  }

  deleteSelectedTemplate(): void {
    const template = this.selectedTemplate;
    if (!template) {
      return;
    }
    if (!confirm(`¿Eliminar la plantilla «${template.name}»?`)) {
      return;
    }

    this.savingTemplate = true;
    this.contentTemplates
      .delete(template.id)
      .pipe(
        finalize(() => (this.savingTemplate = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.templates = this.templates.filter((t) => t.id !== template.id);
          this.selectedTemplateId = null;
          this.showModal('Plantilla eliminada.', false, true);
        },
        error: (err) => {
          this.error = getHttpErrorMessage(err, 'No se pudo eliminar la plantilla.');
        },
      });
  }

  onValidate(): void {
    const phones = this.parsedPhones;
    if (!phones.length) {
      this.error = 'Selecciona al menos un estudiante con teléfono válido.';
      return;
    }
    if (phones.length > MAX_PHONES_PER_SEND) {
      this.error = `Máximo ${MAX_PHONES_PER_SEND} destinatarios por envío.`;
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

    const recipients = this.validRecipients;
    this.sending = true;
    this.error = null;
    this.currentJob = null;
    this.sendResults = [];
    this.lastEnqueue = null;
    this.sendProgressIndex = 0;
    this.sendProgressTotal = recipients.length;

    from(recipients)
      .pipe(
        concatMap((recipient) => {
          const contact =
            recipients.length === 1 && this.contact.trim()
              ? this.contact.trim()
              : recipient.contactName;

          return this.notificador
            .send({
              batchId: this.batchId,
              phones: [recipient.phone!],
              contact,
              contentMessage: this.contentMessage.trim(),
            })
            .pipe(
              tap((enqueued) => {
                this.lastEnqueue = enqueued;
              }),
              concatMap((enqueued) =>
                this.notificador.pollJobUntilComplete(enqueued.jobId),
              ),
              tap((job) => {
                this.appendSendResult(recipient, job);
                this.sendProgressIndex = this.sendResults.length;
                this.currentJob = this.buildAggregatedJobView(recipients.length);
              }),
            );
        }),
        finalize(() => {
          this.sending = false;
          this.sendProgressIndex = 0;
          this.sendProgressTotal = 0;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (err) => {
          this.error = this.formatSendError(err);
          this.showModal(this.error, true);
        },
        complete: () => {
          this.refreshGateStatus();
          const failed = this.sendResults.filter((r) => r.status === 'failed');
          const sent = this.sendResults.filter((r) => r.status === 'sent');

          if (failed.length === 0 && sent.length > 0) {
            this.showModal(
              sent.length === 1
                ? 'Mensaje enviado correctamente.'
                : `${sent.length} mensajes enviados correctamente.`,
              false,
              true,
            );
          } else if (failed.length > 0) {
            this.showModal(this.buildFailureModalMessage(sent.length, failed), true);
          }
        },
      });
  }

  toggleHelp(): void {
    this.helpExpanded = !this.helpExpanded;
  }

  onNewCampaign(): void {
    if (this.jobInProgress || this.sending) {
      return;
    }
    this.batchId = crypto.randomUUID();
    this.resumedCampaign = false;
    this.contact = '';
    this.contentMessage = '';
    this.selectedRecipients = [];
    this.selectorResetTrigger++;
    this.validation = null;
    this.lastEnqueue = null;
    this.currentJob = null;
    this.sendResults = [];
    this.selectedTemplateId = null;
    this.error = null;
    this.showSaveTemplateForm = false;
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

  trackBySendResult(_index: number, row: WhatsappSendDisplayResult): string {
    return `${row.recipientName ?? ''}-${row.phone}-${_index}`;
  }

  resultStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      sent: 'Enviado',
      failed: 'No enviado',
      skipped: 'Omitido',
    };
    return labels[status] ?? status;
  }

  getResultDetail(row: WhatsappSendDisplayResult): string {
    if (row.status === 'failed') {
      return row.error?.trim() || 'No se pudo enviar (sin detalle del proveedor)';
    }
    if (row.status === 'sent' && row.notificadorId) {
      return `Confirmado · ID ${row.notificadorId}`;
    }
    if (row.status === 'sent') {
      return 'Enviado correctamente';
    }
    return '—';
  }

  trackByRecipient(_index: number, row: StudentRecipient): number {
    return row.user.id;
  }

  private appendSendResult(
    recipient: StudentRecipient,
    job: WhatsappJobStatusResponse,
  ): void {
    const row = job.results?.[0];
    this.sendResults.push({
      recipientName: recipient.contactName,
      phone: row?.phone ?? recipient.phone ?? '—',
      status: row?.status ?? (job.success ? 'sent' : 'failed'),
      httpStatus: row?.httpStatus,
      notificadorId: row?.notificadorId,
      error:
        row?.error ??
        (job.success
          ? undefined
          : job.errorMessage ?? 'El mensaje no pudo enviarse'),
    });
  }

  private buildAggregatedJobView(totalRecipients: number): WhatsappJobStatusResponse {
    const sent = this.sendResults.filter((r) => r.status === 'sent').length;
    const failed = this.sendResults.filter((r) => r.status === 'failed').length;
    const done = this.sendResults.length >= totalRecipients;
    const status: WhatsappJobStatus =
      failed === 0 ? 'COMPLETED' : sent === 0 ? 'FAILED' : 'PARTIAL';

    return {
      jobId: this.lastEnqueue?.jobId ?? '',
      batchId: this.batchId,
      status: done ? status : 'PROCESSING',
      completed: done,
      success: done && failed === 0,
      totalCount: totalRecipients,
      sentCount: sent,
      failedCount: failed,
      contact: this.contact,
      templateId: this.lastEnqueue?.templateId ?? '',
      results: [...this.sendResults],
      errorMessage: this.buildAggregatedErrorMessage(failed, sent),
      createdAt: new Date().toISOString(),
    };
  }

  private buildAggregatedErrorMessage(failed: number, sent: number): string | undefined {
    if (failed === 0) {
      return undefined;
    }
    const failedRows = this.sendResults.filter((r) => r.status === 'failed');
    if (failedRows.length === 1) {
      return failedRows[0].error ?? 'El mensaje no pudo enviarse';
    }
    if (sent > 0) {
      return `${failed} de ${this.sendResults.length} no se enviaron. Revisa el motivo en la tabla.`;
    }
    return `Ningún mensaje se envió (${failed} fallidos). Revisa el motivo en la tabla.`;
  }

  private buildFailureModalMessage(
    sentCount: number,
    failed: WhatsappSendDisplayResult[],
  ): string {
    const header =
      sentCount > 0
        ? `Se enviaron ${sentCount} y fallaron ${failed.length}:`
        : `No se pudo enviar a ${failed.length} destinatario(s):`;
    const lines = failed
      .map((r) => {
        const who = r.recipientName ?? r.phone;
        const reason =
          r.error?.trim() || 'Sin detalle del proveedor';
        return `• ${who}: ${reason}`;
      })
      .join('<br>');
    return `${header}<br>${lines}`;
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
      const remaining =
        new Date(this.gateStatus!.nextAvailableAt!).getTime() - Date.now();
      if (remaining <= 0) {
        this.cooldownLabel = null;
        this.clearCooldownTimer();
        this.refreshGateStatus();
        return;
      }
      const sec = Math.ceil(remaining / 1000);
      const min = Math.floor(sec / 60);
      const rest = sec % 60;
      this.cooldownLabel = min > 0 ? `${min} min ${rest} s` : `${rest} s`;
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
    this.clearModalDismissTimer();
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      close: () => {
        this.modal.show = false;
        this.clearModalDismissTimer();
      },
    };

    const durationMs = isSuccess ? 2000 : message.includes('<br>') ? 7000 : 4500;
    this.modalDismissTimer = setTimeout(() => {
      this.modal.show = false;
      this.modalDismissTimer = null;
    }, durationMs);
  }

  private clearModalDismissTimer(): void {
    if (this.modalDismissTimer) {
      clearTimeout(this.modalDismissTimer);
      this.modalDismissTimer = null;
    }
  }
}
