import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import {
  RemotePlatformAssessmentFilters,
  RemotePlatformAssessmentItem,
} from '../../../services/dtos/platform-assessment.dto';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

@Component({
  selector: 'app-platform-assessments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
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

  constructor(private platformAssessmentService: PlatformAssessmentService) {}

  ngOnInit(): void {
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

  displayStudent(row: RemotePlatformAssessmentItem): string {
    return (
      row.studentDisplayName?.trim() ||
      [row.studentFirstName, row.studentLastName].filter(Boolean).join(' ') ||
      `ID ${row.studentId ?? row.externalStudentId}`
    );
  }

  canApplyWriting(row: RemotePlatformAssessmentItem): boolean {
    return (
      row.mirrorId != null &&
      row.points != null &&
      !row.writingApplied
    );
  }

  canCorrectWriting(row: RemotePlatformAssessmentItem): boolean {
    return row.mirrorId != null && row.writingApplied === true;
  }

  writingActionLabel(row: RemotePlatformAssessmentItem): string {
    return this.canCorrectWriting(row) ? 'Corregir Writing' : 'Aplicar Writing';
  }

  startApplyWriting(row: RemotePlatformAssessmentItem): void {
    if (
      (!this.canApplyWriting(row) && !this.canCorrectWriting(row)) ||
      row.mirrorId == null
    ) {
      return;
    }
    this.applyTarget = row;
    const correcting = this.canCorrectWriting(row);
    const pts = row.points;
    this.modal = {
      ...modalInitializer(),
      show: true,
      message: correcting
        ? `¿Corregir Writing a ${pts} puntos para ${this.displayStudent(row)}? (ya aplicado vía S2S/admin)`
        : `¿Aplicar Writing con ${pts} puntos para ${this.displayStudent(row)}?`,
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

    const correcting = target.writingApplied === true;

    this.platformAssessmentService
      .applyWritingScore(target.mirrorId, target.points ?? undefined)
      .subscribe({
        next: (res) => {
          this.applyTarget = null;
          const action = correcting ? 'corregido' : 'aplicado';
          this.modal = {
            ...modalInitializer(),
            show: true,
            message: res.updatedStage
              ? `Writing ${action}. El estudiante fue promovido de stage.`
              : `Writing ${action}. Stage no cambió (faltan otros skills o ya promovido).`,
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
            message: correcting
              ? 'No se pudo corregir Writing.'
              : 'No se pudo aplicar Writing.',
            isError: true,
            close: () => (this.modal.show = false),
          };
        },
      });
  }

  private emptyFilters(): RemotePlatformAssessmentFilters {
    return {
      studentId: undefined,
      templateTitle: '',
      status: '',
      outcome: '',
      studentStage: undefined,
    };
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
