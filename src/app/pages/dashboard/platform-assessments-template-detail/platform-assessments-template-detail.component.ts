import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import {
  RemotePlatformAssessmentItem,
  RemoteTemplateItem,
} from '../../../services/dtos/platform-assessment.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-platform-assessments-template-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent],
  templateUrl: './platform-assessments-template-detail.component.html',
  styleUrls: ['./platform-assessments-template-detail.component.scss'],
})
export class PlatformAssessmentsTemplateDetailComponent implements OnInit {
  templateId = '';
  template: RemoteTemplateItem | null = null;
  templateLoading = false;

  rows: RemotePlatformAssessmentItem[] = [];
  loading = false;
  errorMessage = '';

  total = 0;
  page = 1;
  limit = 20;

  statusFilter = '';
  outcomeFilter: '' | 'PASSED' | 'FAILED' | 'NONE' = '';

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

  modal: ModalDto = modalInitializer();
  applyTarget: RemotePlatformAssessmentItem | null = null;

  constructor(
    private route: ActivatedRoute,
    private platformAssessmentService: PlatformAssessmentService,
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('templateId') ?? '';
    if (!this.templateId) {
      this.errorMessage = 'Template id faltante.';
      return;
    }
    this.loadTemplate();
    this.fetchAssignments();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit) || 1);
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchAssignments();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.outcomeFilter = '';
    this.page = 1;
    this.fetchAssignments();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.fetchAssignments();
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

  displayStudent(row: RemotePlatformAssessmentItem): string {
    return (
      row.studentDisplayName?.trim() ||
      [row.studentFirstName, row.studentLastName].filter(Boolean).join(' ') ||
      `ID ${row.studentId ?? row.externalStudentId}`
    );
  }

  canApplyWriting(row: RemotePlatformAssessmentItem): boolean {
    return row.mirrorId != null && row.points != null && !row.writingApplied;
  }

  writingActionLabel(): string {
    return 'Aceptar Evaluación';
  }

  startApplyWriting(row: RemotePlatformAssessmentItem): void {
    if (!this.canApplyWriting(row) || row.mirrorId == null) {
      return;
    }
    this.applyTarget = row;
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: `¿Aceptar evaluación con ${row.points} puntos para ${this.displayStudent(row)}?`,
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
            isSuccess: true,
            message: res.updatedStage
              ? 'Grammar registrado. Stage promovido.'
              : 'Grammar registrado. Stage sin cambio.',
            close: () => (this.modal.show = false),
          };
          this.fetchAssignments();
        },
        error: () => {
          this.applyTarget = null;
          this.modal = {
            ...modalInitializer(),
            show: true,
            isError: true,
            message: 'No se pudo registrar Grammar.',
            close: () => (this.modal.show = false),
          };
        },
      });
  }

  private loadTemplate(): void {
    this.templateLoading = true;
    this.platformAssessmentService.getTemplate(this.templateId).subscribe({
      next: (t) => {
        this.template = t;
        this.templateLoading = false;
      },
      error: (err) => {
        this.template = null;
        this.templateLoading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'No se pudo cargar el assessment.';
      },
    });
  }

  private fetchAssignments(): void {
    this.loading = true;
    this.platformAssessmentService
      .getTemplateAssignments(this.templateId, {
        page: this.page,
        limit: this.limit,
        status: this.statusFilter || undefined,
        outcome: this.outcomeFilter || undefined,
      })
      .subscribe({
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
            'No se pudieron cargar los estudiantes asignados.';
        },
      });
  }
}
