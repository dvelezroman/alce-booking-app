import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EarlyWarningsService } from '../../../services/early-warnings.service';
import { StagesService } from '../../../services/stages.service';
import {
  EarlyWarningAlertTypeFilter,
  EarlyWarningClassification,
  EarlyWarningFilterOptionsDto,
  EarlyWarningFollowUpChannel,
  EarlyWarningFollowUpFilter,
  EarlyWarningListParams,
  EarlyWarningListResponseDto,
  EarlyWarningMode,
  EarlyWarningRowDto,
  EarlyWarningSummaryDto,
} from '../../../services/dtos/early-warnings.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-early-warnings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './early-warnings.component.html',
  styleUrl: './early-warnings.component.scss',
})
export class EarlyWarningsComponent implements OnInit {
  loading = false;
  summaryLoading = false;
  exporting = false;
  error: string | null = null;

  summary: EarlyWarningSummaryDto | null = null;
  list: EarlyWarningListResponseDto | null = null;
  stages: Stage[] = [];
  filterOptions: EarlyWarningFilterOptionsDto = {
    cities: [],
    classifications: ['KIDS', 'TEENS', 'ADULTS'],
    modes: ['ONLINE', 'PRESENCIAL', 'SEMIPRESENCIAL'],
  };

  page = 1;
  limit = 20;
  alertType: EarlyWarningAlertTypeFilter = 'any';
  stageId: number | null = null;
  search = '';
  classification: EarlyWarningClassification | null = null;
  mode: EarlyWarningMode | null = null;
  city: string | null = null;
  minDaysInStage: number | null = null;
  maxDaysInStage: number | null = null;
  minMeetingsInWindow: number | null = null;
  maxMeetingsInWindow: number | null = null;
  followUpFilter: EarlyWarningFollowUpFilter = 'all';

  followUpModalOpen = false;
  followUpSaving = false;
  followUpEditorRow: EarlyWarningRowDto | null = null;
  followUpChannel: EarlyWarningFollowUpChannel | null = null;
  followUpNotes = '';
  followUpContactDate = '';
  savingFollowUpStudentIds = new Set<number>();

  readonly followUpChannels: {
    value: EarlyWarningFollowUpChannel;
    label: string;
  }[] = [
    { value: 'PHONE', label: 'Llamada telefónica' },
    { value: 'EMAIL', label: 'Correo' },
    { value: 'MESSAGE', label: 'Mensaje' },
    { value: 'WARNING_CALL', label: 'Llamada de atención' },
  ];

  constructor(
    private readonly earlyWarnings: EarlyWarningsService,
    private readonly stagesService: StagesService,
  ) {}

  ngOnInit(): void {
    this.loadStages();
    this.loadFilterOptions();
    this.loadSummary();
    this.loadList();
  }

  private currentFilterParams(
    includePagination = false,
  ): EarlyWarningListParams {
    const params: EarlyWarningListParams = {
      alertType: this.alertType,
      stageId: this.stageId ?? undefined,
      search: this.search || undefined,
      classification: this.classification ?? undefined,
      mode: this.mode ?? undefined,
      city: this.city || undefined,
      minDaysInStage: this.minDaysInStage,
      maxDaysInStage: this.maxDaysInStage,
      minMeetingsInWindow: this.minMeetingsInWindow,
      maxMeetingsInWindow: this.maxMeetingsInWindow,
      followUp: this.followUpFilter === 'all' ? undefined : this.followUpFilter,
    };
    if (includePagination) {
      params.page = this.page;
      params.limit = this.limit;
    }
    return params;
  }

  loadStages(): void {
    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = stages ?? [];
      },
      error: () => {
        this.stages = [];
      },
    });
  }

  loadFilterOptions(): void {
    this.earlyWarnings.getFilterOptions().subscribe({
      next: (options) => {
        this.filterOptions = options;
      },
      error: () => {
        /* keep defaults */
      },
    });
  }

  loadSummary(): void {
    this.summaryLoading = true;
    this.earlyWarnings.getSummary(this.currentFilterParams()).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.summaryLoading = false;
      },
      error: () => {
        this.summaryLoading = false;
      },
    });
  }

  loadList(): void {
    this.loading = true;
    this.error = null;
    this.earlyWarnings.list(this.currentFilterParams(true)).subscribe({
      next: (res) => {
        this.list = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el listado de alertas tempranas.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadList();
    this.loadSummary();
  }

  clearFilters(): void {
    this.alertType = 'any';
    this.stageId = null;
    this.search = '';
    this.classification = null;
    this.mode = null;
    this.city = null;
    this.minDaysInStage = null;
    this.maxDaysInStage = null;
    this.minMeetingsInWindow = null;
    this.maxMeetingsInWindow = null;
    this.followUpFilter = 'all';
    this.page = 1;
    this.loadList();
    this.loadSummary();
  }

  downloadExcel(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.earlyWarnings.downloadExcel(this.currentFilterParams()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        anchor.href = url;
        anchor.download = `alertas-tempranas-${dateStr}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => {
        this.error = 'No se pudo descargar el informe Excel.';
        this.exporting = false;
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1) return;
    const totalPages = this.totalPages;
    if (page > totalPages) return;
    this.page = page;
    this.loadList();
  }

  get totalPages(): number {
    if (!this.list || this.list.limit <= 0) return 1;
    return Math.max(1, Math.ceil(this.list.totalCount / this.list.limit));
  }

  get displaySummary(): EarlyWarningSummaryDto | null {
    if (this.list?.filteredSummary && this.summary) {
      return {
        ...this.summary,
        ...this.list.filteredSummary,
      };
    }
    return this.summary;
  }

  fullName(row: EarlyWarningRowDto): string {
    return `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || '—';
  }

  email(row: EarlyWarningRowDto): string {
    return row.emailAddress || row.email || '—';
  }

  classificationLabel(value: string | null | undefined): string {
    switch (value) {
      case 'KIDS':
        return 'Kids';
      case 'TEENS':
        return 'Teens';
      case 'ADULTS':
        return 'Adults';
      default:
        return '—';
    }
  }

  modeLabel(value: string | null | undefined): string {
    switch (value) {
      case 'ONLINE':
        return 'Online';
      case 'PRESENCIAL':
        return 'Presencial';
      case 'SEMIPRESENCIAL':
        return 'Semipresencial';
      default:
        return '—';
    }
  }

  formatStageEntry(iso: string | null | undefined): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  trackByStudentId(_index: number, row: EarlyWarningRowDto): number {
    return row.studentId;
  }

  followUpDone(row: EarlyWarningRowDto): boolean {
    return !row.followUpPending;
  }

  isSavingFollowUp(row: EarlyWarningRowDto): boolean {
    return this.savingFollowUpStudentIds.has(row.studentId);
  }

  onFollowUpToggle(row: EarlyWarningRowDto, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.openFollowUpEditor(row);
      input.checked = this.followUpDone(row);
      return;
    }
    this.saveFollowUp(row, {
      status: 'PENDING',
    });
  }

  openFollowUpEditor(row: EarlyWarningRowDto): void {
    this.followUpEditorRow = row;
    this.followUpChannel = row.followUp?.channel ?? null;
    this.followUpNotes = row.followUp?.notes ?? '';
    this.followUpContactDate = row.followUp?.contactedAt
      ? row.followUp.contactedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    this.followUpModalOpen = true;
  }

  closeFollowUpEditor(): void {
    this.followUpModalOpen = false;
    this.followUpEditorRow = null;
    this.followUpSaving = false;
  }

  submitFollowUpEditor(): void {
    if (!this.followUpEditorRow) return;
    this.saveFollowUp(this.followUpEditorRow, {
      status: 'DONE',
      channel: this.followUpChannel,
      notes: this.followUpNotes.trim() || null,
      contactedAt: this.followUpContactDate
        ? new Date(`${this.followUpContactDate}T12:00:00`).toISOString()
        : null,
    });
  }

  private saveFollowUp(
    row: EarlyWarningRowDto,
    body: {
      status: 'PENDING' | 'DONE';
      channel?: EarlyWarningFollowUpChannel | null;
      notes?: string | null;
      contactedAt?: string | null;
    },
  ): void {
    if (this.savingFollowUpStudentIds.has(row.studentId)) return;
    this.savingFollowUpStudentIds.add(row.studentId);
    this.followUpSaving = true;
    this.earlyWarnings.upsertFollowUp(row.studentId, body).subscribe({
      next: (res) => {
        this.patchRowFollowUp(row.studentId, res);
        this.savingFollowUpStudentIds.delete(row.studentId);
        this.followUpSaving = false;
        if (body.status === 'DONE') {
          this.closeFollowUpEditor();
        }
        this.loadSummary();
      },
      error: () => {
        this.error = 'No se pudo guardar el seguimiento.';
        this.savingFollowUpStudentIds.delete(row.studentId);
        this.followUpSaving = false;
      },
    });
  }

  private patchRowFollowUp(
    studentId: number,
    res: {
      followUp: EarlyWarningRowDto['followUp'];
      followUpPending: boolean;
      isNewAlert: boolean;
    },
  ): void {
    if (!this.list?.items) return;
    const idx = this.list.items.findIndex((r) => r.studentId === studentId);
    if (idx < 0) return;
    this.list.items[idx] = {
      ...this.list.items[idx],
      followUp: res.followUp,
      followUpPending: res.followUpPending,
      isNewAlert: res.isNewAlert,
    };
  }

  channelLabel(value: string | null | undefined): string {
    return (
      this.followUpChannels.find((c) => c.value === value)?.label ?? '—'
    );
  }
}
