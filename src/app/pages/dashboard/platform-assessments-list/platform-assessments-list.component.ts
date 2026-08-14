import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import {
  RemotePlatformAssessmentFilters,
  RemotePlatformAssessmentItem,
  RemoteTemplateItem,
} from '../../../services/dtos/platform-assessment.dto';
import { StagesService } from '../../../services/stages.service';
import { Stage } from '../../../services/dtos/student.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-platform-assessments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  templateUrl: './platform-assessments-list.component.html',
  styleUrls: ['./platform-assessments-list.component.scss'],
})
export class PlatformAssessmentsListComponent implements OnInit {
  rows: RemotePlatformAssessmentItem[] = [];
  loading = false;
  errorMessage = '';
  showFilters = true;

  total = 0;
  page = 1;
  limit = 20;

  draft: RemotePlatformAssessmentFilters = this.emptyFilters();
  applied: RemotePlatformAssessmentFilters = this.emptyFilters();

  modal: ModalDto = modalInitializer();
  applyTarget: RemotePlatformAssessmentItem | null = null;
  extendTarget: RemotePlatformAssessmentItem | null = null;
  extendDraft = '';
  grantTarget: RemotePlatformAssessmentItem | null = null;
  actionBusyId: string | null = null;

  templates: RemoteTemplateItem[] = [];
  stages: Stage[] = [];

  readonly statusOptions = [
    '',
    'CREATED',
    'ACTIVE',
    'COMPLETED',
    'REVOKED',
    'EXPIRED',
  ];
  readonly outcomeOptions: Array<'' | 'PASSED' | 'FAILED' | 'NONE'> = [
    '',
    'PASSED',
    'FAILED',
    'NONE',
  ];

  constructor(
    private platformAssessmentService: PlatformAssessmentService,
    private stagesService: StagesService,
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.fetch();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit) || 1);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.page = 1;
    this.applied = { ...this.draft };
    this.fetch();
  }

  clearFilters(): void {
    this.draft = this.emptyFilters();
    this.applied = this.emptyFilters();
    this.page = 1;
    this.fetch();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.fetch();
  }

  openUrl(url: string | null | undefined): void {
    const trimmed = url?.trim();
    if (!trimmed) return;
    window.open(trimmed, '_blank', 'noopener,noreferrer');
  }

  outcomeClass(outcome: string | null): string {
    if (outcome === 'PASSED') return 'badge-green';
    if (outcome === 'FAILED') return 'badge-red';
    return 'badge-gray';
  }

  stageLabel(stage: Stage): string {
    const desc = stage.description?.trim();
    return desc ? `${stage.number} — ${desc}` : stage.number;
  }

  displayStudent(row: RemotePlatformAssessmentItem): string {
    return (
      row.studentDisplayName?.trim() ||
      [row.studentFirstName, row.studentLastName].filter(Boolean).join(' ') ||
      `ID ${row.studentId ?? row.externalStudentId}`
    );
  }

  canShowWritingAction(row: RemotePlatformAssessmentItem): boolean {
    return row.mirrorId != null && row.points != null;
  }

  isWritingLocked(row: RemotePlatformAssessmentItem): boolean {
    return row.writingAccepted === true;
  }

  writingActionLabel(row: RemotePlatformAssessmentItem): string {
    return this.isWritingLocked(row) ? 'Aceptada' : 'Aceptar Evaluación';
  }

  startApplyWriting(row: RemotePlatformAssessmentItem): void {
    if (
      !this.canShowWritingAction(row) ||
      this.isWritingLocked(row) ||
      row.mirrorId == null
    ) {
      return;
    }
    this.applyTarget = row;
    const pts = row.points;
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Aceptar evaluación con ${pts} puntos para ${this.displayStudent(row)}?`,
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      confirm: () => this.confirmApplyWriting(),
      close: () => {
        this.applyTarget = null;
        this.modal.show = false;
      },
    };
  }

  confirmApplyWriting(): void {
    const target = this.applyTarget;
    if (!target?.mirrorId) {
      this.applyTarget = null;
      this.modal.show = false;
      return;
    }

    this.platformAssessmentService
      .applyWritingScore(target.mirrorId, target.points ?? undefined)
      .subscribe({
        next: (res) => {
          this.applyTarget = null;
          this.modal = {
            ...modalInitializer(),
            show: true,
            message: res.updatedStage
              ? 'Evaluación aceptada. El estudiante fue promovido de stage.'
              : 'Evaluación aceptada. Stage no cambió (faltan otros skills o ya promovido).',
            isSuccess: true,
            close: () => (this.modal.show = false),
          };
          this.fetch();
        },
        error: () => {
          this.applyTarget = null;
          this.modal = {
            ...modalInitializer(),
            show: true,
            message: 'No se pudo registrar Grammar.',
            isError: true,
            close: () => (this.modal.show = false),
          };
        },
      });
  }

  canGrantAttempt(row: RemotePlatformAssessmentItem): boolean {
    return row.status !== 'REVOKED';
  }

  canExtend(row: RemotePlatformAssessmentItem): boolean {
    return row.status !== 'REVOKED';
  }

  startExtend(row: RemotePlatformAssessmentItem): void {
    if (!this.canExtend(row)) return;
    const draft = window.prompt(
      `Nueva fecha límite (local YYYY-MM-DDTHH:mm) para ${this.displayStudent(row)}`,
      this.toDatetimeLocalValue(row.expiresAt),
    );
    if (!draft?.trim()) return;

    const parsed = new Date(draft.trim());
    if (Number.isNaN(parsed.getTime())) {
      this.modal = {
        ...modalInitializer(),
        show: true,
        message: 'Fecha inválida.',
        isError: true,
        close: () => (this.modal.show = false),
      };
      return;
    }

    this.extendTarget = row;
    this.extendDraft = draft.trim();
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Extender fecha límite de ${this.displayStudent(row)} a ${parsed.toLocaleString()}?`,
      isInfo: true,
      showButtons: true,
      confirm: () => this.confirmExtend(),
      close: () => {
        this.extendTarget = null;
        this.modal.show = false;
      },
    };
  }

  confirmExtend(): void {
    const target = this.extendTarget;
    const draft = this.extendDraft?.trim();
    if (!target || !draft) {
      this.extendTarget = null;
      this.modal.show = false;
      return;
    }

    const expiresAt = new Date(draft).toISOString();
    this.actionBusyId = target.assignmentId;
    this.platformAssessmentService
      .updateAssignment(target.assignmentId, expiresAt)
      .subscribe({
        next: () => {
          this.actionBusyId = null;
          this.extendTarget = null;
          this.modal = {
            ...modalInitializer(),
            show: true,
            message: 'Fecha límite actualizada.',
            isSuccess: true,
            close: () => (this.modal.show = false),
          };
          this.fetch();
        },
        error: (err) => {
          this.actionBusyId = null;
          this.extendTarget = null;
          this.modal = {
            ...modalInitializer(),
            show: true,
            message:
              err?.error?.message ||
              err?.message ||
              'No se pudo actualizar la fecha límite.',
            isError: true,
            close: () => (this.modal.show = false),
          };
        },
      });
  }

  startGrantAttempt(row: RemotePlatformAssessmentItem): void {
    if (!this.canGrantAttempt(row)) return;
    this.grantTarget = row;
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Otorgar otro intento a ${this.displayStudent(row)}? (maxAttempts ${row.maxAttempts} → al menos ${row.attemptCount + 1}). El estado en booking vuelve a pending.`,
      isInfo: true,
      showButtons: true,
      confirm: () => this.confirmGrantAttempt(),
      close: () => {
        this.grantTarget = null;
        this.modal.show = false;
      },
    };
  }

  confirmGrantAttempt(): void {
    const target = this.grantTarget;
    if (!target) {
      this.modal.show = false;
      return;
    }

    this.actionBusyId = target.assignmentId;
    this.platformAssessmentService.grantAttempt(target.assignmentId).subscribe({
      next: (res) => {
        this.actionBusyId = null;
        this.grantTarget = null;
        this.modal = {
          ...modalInitializer(),
          show: true,
          message: `Intento otorgado. maxAttempts=${res.maxAttempts}, status=${res.status}.`,
          isSuccess: true,
          close: () => (this.modal.show = false),
        };
        this.fetch();
      },
      error: (err) => {
        this.actionBusyId = null;
        this.grantTarget = null;
        this.modal = {
          ...modalInitializer(),
          show: true,
          message:
            err?.error?.message ||
            err?.message ||
            'No se pudo otorgar otro intento.',
          isError: true,
          close: () => (this.modal.show = false),
        };
      },
    });
  }

  private toDatetimeLocalValue(iso: string | null): string {
    if (!iso) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setMinutes(0, 0, 0);
      return this.formatDatetimeLocal(d);
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return this.formatDatetimeLocal(d);
  }

  private formatDatetimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private emptyFilters(): RemotePlatformAssessmentFilters {
    return {
      studentId: undefined,
      templateId: '',
      templateTitle: '',
      status: '',
      outcome: '',
      studentStage: undefined,
    };
  }

  private loadFilterOptions(): void {
    forkJoin({
      templates: this.platformAssessmentService.getTemplates({
        page: 1,
        pageSize: 100,
      }),
      stages: this.stagesService.getAll(),
    }).subscribe({
      next: ({ templates, stages }) => {
        this.templates = templates.data ?? [];
        this.stages = stages ?? [];
      },
      error: () => {
        this.templates = [];
        this.stages = [];
      },
    });
  }

  private fetch(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters: RemotePlatformAssessmentFilters = {
      ...this.applied,
      page: this.page,
      limit: this.limit,
    };

    this.platformAssessmentService.getRemote(filters).subscribe({
      next: (res) => {
        this.rows = res.data ?? [];
        this.total = res.total ?? 0;
        this.page = res.page ?? this.page;
        this.limit = res.limit ?? this.limit;
        this.loading = false;
      },
      error: (err) => {
        this.rows = [];
        this.total = 0;
        this.loading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'No se pudo cargar el listado de exámenes plataforma.';
      },
    });
  }
}
