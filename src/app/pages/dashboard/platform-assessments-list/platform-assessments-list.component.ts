import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import {
  RemotePlatformAssessmentFilters,
  RemotePlatformAssessmentItem,
} from '../../../services/dtos/platform-assessment.dto';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { PlatformAssessmentListHeaderComponent } from '../../../components/platform-assessment-list/platform-assessment-list-header/platform-assessment-list-header.component';
import { PlatformAssessmentListFiltersComponent } from '../../../components/platform-assessment-list/platform-assessment-list-filters/platform-assessment-list-filters.component';
import { PlatformAssessmentListTableComponent } from '../../../components/platform-assessment-list/platform-assessment-list-table/platform-assessment-list-table.component';
import { PlatformAssessmentListPaginationComponent } from '../../../components/platform-assessment-list/platform-assessment-list-pagination/platform-assessment-list-pagination.component';
import { PlatformAssessmentListEmptyStateComponent } from '../../../components/platform-assessment-list/platform-assessment-list-empty-state/platform-assessment-list-empty-state.component';

@Component({
  selector: 'app-platform-assessments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ModalComponent,
    PlatformAssessmentListHeaderComponent,
    PlatformAssessmentListFiltersComponent,
    PlatformAssessmentListTableComponent,
    PlatformAssessmentListPaginationComponent,
    PlatformAssessmentListEmptyStateComponent,
  ],
  templateUrl: './platform-assessments-list-2.component.html',
  styleUrls: ['./platform-assessments-list-2.component.scss'],
})
export class PlatformAssessmentsListComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  rows: RemotePlatformAssessmentItem[] = [];
  loading = false;
  errorMessage = '';
  showFilters = true;


  /* =========================
     PAGINATION
  ========================= */

  total = 0;
  page = 1;
  limit = 20;

  readonly limitOptions = [10, 20, 50, 100];


  /* =========================
     FILTERS
  ========================= */

  draft: RemotePlatformAssessmentFilters = this.emptyFilters();
  applied: RemotePlatformAssessmentFilters = this.emptyFilters();


  /* =========================
     MODAL
  ========================= */

  modal: ModalDto = modalInitializer();
  applyTarget: RemotePlatformAssessmentItem | null = null;


  /* =========================
     OPTIONS
  ========================= */

  readonly statusOptions = [
    '',
    'CREATED',
    'ACTIVE',
    'COMPLETED',
    'REVOKED',
    'EXPIRED',
  ];

  readonly outcomeOptions: Array<
    '' | 'PASSED' | 'FAILED' | 'NONE'
  > = [
    '',
    'PASSED',
    'FAILED',
    'NONE',
  ];


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private platformAssessmentService: PlatformAssessmentService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.fetch();
  }


  /* =========================
     PAGINATION STATE
  ========================= */

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.total / this.limit) || 1,
    );
  }

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return this.page < this.totalPages;
  }

  get startIndex(): number {
    if (!this.total) {
      return 0;
    }

    return (
      (this.page - 1) * this.limit
    ) + 1;
  }

  get endIndex(): number {
    return Math.min(
      this.page * this.limit,
      this.total,
    );
  }

  get paginationLabel(): string {
    if (!this.total) {
      return '0 evaluaciones';
    }

    return (
      `Mostrando ${this.startIndex} ` +
      `a ${this.endIndex} ` +
      `de ${this.total} evaluaciones`
    );
  }


  /* =========================
     FILTERS
  ========================= */

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

  onDraftChange(
    filters: RemotePlatformAssessmentFilters,
  ): void {
    this.draft = {
      ...filters,
    };
  }


  /* =========================
     PAGINATION
  ========================= */

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
    this.fetch();
  }

  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.goToPage(
      this.page - 1,
    );
  }

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.goToPage(
      this.page + 1,
    );
  }

  onPageChange(
    page: number,
  ): void {
    this.goToPage(page);
  }

  onLimitChange(
    value: number,
  ): void {
    const limit = Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0 ||
      limit === this.limit
    ) {
      return;
    }

    this.limit = limit;
    this.page = 1;
    this.fetch();
  }


  /* =========================
     URL
  ========================= */

  openUrl(
    url: string | null | undefined,
  ): void {
    const trimmed =
      url?.trim();

    if (!trimmed) {
      return;
    }

    window.open(
      trimmed,
      '_blank',
      'noopener,noreferrer',
    );
  }


  /* =========================
     OUTCOME
  ========================= */

  outcomeClass(
    outcome: string | null,
  ): string {
    if (outcome === 'PASSED') {
      return 'badge-green';
    }

    if (outcome === 'FAILED') {
      return 'badge-red';
    }

    return 'badge-gray';
  }


  /* =========================
     STUDENT
  ========================= */

  displayStudent(
    row: RemotePlatformAssessmentItem,
  ): string {
    return (
      row.studentDisplayName?.trim() ||
      [
        row.studentFirstName,
        row.studentLastName,
      ]
        .filter(Boolean)
        .join(' ') ||
      `ID ${
        row.studentId ??
        row.externalStudentId
      }`
    );
  }


  /* =========================
     WRITING
  ========================= */

  canApplyWriting(
    row: RemotePlatformAssessmentItem,
  ): boolean {
    return (
      row.mirrorId != null &&
      row.points != null &&
      !row.writingApplied
    );
  }

  canCorrectWriting(
    row: RemotePlatformAssessmentItem,
  ): boolean {
    return (
      row.mirrorId != null &&
      row.writingApplied === true
    );
  }

  writingActionLabel(
    row: RemotePlatformAssessmentItem,
  ): string {
    return this.canCorrectWriting(row)
      ? 'Corregir Writing'
      : 'Aplicar Writing';
  }

  startApplyWriting(
    row: RemotePlatformAssessmentItem,
  ): void {
    if (
      (
        !this.canApplyWriting(row) &&
        !this.canCorrectWriting(row)
      ) ||
      row.mirrorId == null
    ) {
      return;
    }

    this.applyTarget = row;

    const correcting =
      this.canCorrectWriting(row);

    const pts =
      row.points;

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
      confirm: () =>
        this.confirmApplyWriting(),
      close: () => {
        this.applyTarget = null;
        this.modal.show = false;
      },
    };
  }

  confirmApplyWriting(): void {
    const target =
      this.applyTarget;

    if (!target?.mirrorId) {
      this.applyTarget = null;
      this.modal.show = false;
      return;
    }

    const correcting =
      target.writingApplied === true;

    this.platformAssessmentService
      .applyWritingScore(
        target.mirrorId,
        target.points ?? undefined,
      )
      .subscribe({
        next: (res) => {
          this.applyTarget = null;

          const action =
            correcting
              ? 'corregido'
              : 'aplicado';

          this.modal = {
            ...modalInitializer(),
            show: true,
            message: res.updatedStage
              ? `Writing ${action}. El estudiante fue promovido de stage.`
              : `Writing ${action}. Stage no cambió (faltan otros skills o ya promovido).`,
            isSuccess: true,
            close: () =>
              this.modal.show = false,
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
            close: () =>
              this.modal.show = false,
          };
        },
      });
  }


  /* =========================
     EMPTY FILTERS
  ========================= */

  private emptyFilters(): RemotePlatformAssessmentFilters {
    return {
      studentId: undefined,
      templateTitle: '',
      status: '',
      outcome: '',
      studentStage: undefined,
    };
  }


  /* =========================
     FETCH
  ========================= */

  private fetch(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters: RemotePlatformAssessmentFilters = {
      ...this.applied,
      page: this.page,
      limit: this.limit,
    };

    this.platformAssessmentService
      .getRemote(filters)
      .subscribe({
        next: (res) => {
          this.rows =
            res.data ?? [];

          this.total =
            res.total ?? 0;

          this.page =
            res.page ?? this.page;

          this.limit =
            res.limit ?? this.limit;

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