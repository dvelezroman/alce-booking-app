import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';
import { UsersService } from '../../../services/users.service';

import {
  FilterEvaluationsDto,
  InstructorEvaluation,
} from '../../../services/dtos/instructor-evaluation.dto';

import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { MeetingEvaluationsHeaderComponent } from '../../../components/meeting-evaluations-2/meeting-evaluations-header/meeting-evaluations-header.component';
import { MeetingEvaluationsSummaryComponent } from '../../../components/meeting-evaluations-2/meeting-evaluations-summary/meeting-evaluations-summary.component';
import { MeetingEvaluationsFiltersComponent } from '../../../components/meeting-evaluations-2/meeting-evaluations-filters/meeting-evaluations-filters.component';
import { MeetingEvaluationsTableComponent } from '../../../components/meeting-evaluations-2/meeting-evaluations-table/meeting-evaluations-table.component';
import { MeetingEvaluationsPaginationComponent } from '../../../components/meeting-evaluations-2/meeting-evaluations-pagination/meeting-evaluations-pagination.component';
import { MeetingEvaluationFormModalComponent } from '../../../components/meeting-evaluations-2/meeting-evaluation-form-modal/meeting-evaluation-form-modal.component';
import { MeetingEvaluationDetailPanelComponent } from '../../../components/meeting-evaluations-2/meeting-evaluation-detail-panel/meeting-evaluation-detail-panel.component';

@Component({
  selector: 'app-meeting-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    MeetingEvaluationsHeaderComponent,
    MeetingEvaluationsSummaryComponent,
    MeetingEvaluationsFiltersComponent,
    MeetingEvaluationsTableComponent,
    MeetingEvaluationsPaginationComponent,
    MeetingEvaluationFormModalComponent,
    MeetingEvaluationDetailPanelComponent,
  ],
  templateUrl: './meeting-evaluations.component.html',
  styleUrl: './meeting-evaluations.component.scss',
})
export class MeetingEvaluationsComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  evaluations: InstructorEvaluation[] = [];
  selectedEvaluation: InstructorEvaluation | null = null;

  filteredStudents: UserDto[] = [];
  filteredInstructors: UserDto[] = [];

  selectedStudent: UserDto | null = null;
  selectedInstructor: UserDto | null = null;

  selectedStudentId: number | undefined;
  selectedInstructorId: number | undefined;


  /* =========================
     SEARCH USERS
  ========================= */

  studentSearchInput$ = new Subject<string>();
  instructorSearchInput$ = new Subject<string>();

  showStudentDropdown = false;
  showInstructorDropdown = false;

  isStudentFieldInvalid = false;
  isInstructorFieldInvalid = false;


  /* =========================
     STATE
  ========================= */

  isLoading = false;
  searchAttempted = false;

  updatingEvaluationId: number | null = null;

  showInstructorColumn = true;
  showStudentColumn = true;


  /* =========================
     MODALS / DETAIL
  ========================= */

  showEvaluationModal = false;
  showCreateEvaluationModal = false;

  modal: ModalDto = modalInitializer();


  /* =========================
     SORT
  ========================= */

  sortBy: 'rating' | 'createdAt' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  private lastFilters?: FilterEvaluationsDto;


  /* =========================
     PAGINATION
  ========================= */

  page = 1;
  limit = 10;

  readonly limitOptions = [
    5,
    10,
    20,
    50,
  ];


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private evaluationService: InstructorEvaluationService,
    private usersService: UsersService,
  ) {
    this.studentSearchInput$
      .pipe(
        debounceTime(300),
      )
      .subscribe((term: string) => {
        this.fetchFilteredStudents(term);
      });

    this.instructorSearchInput$
      .pipe(
        debounceTime(300),
      )
      .subscribe((term: string) => {
        this.fetchFilteredInstructors(term);
      });
  }


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    const { from, to } =
      this.getDefaultDateRange();

    const initialFilters: FilterEvaluationsDto = {
      from,
      to,
      accepted: true,
      limit: 100,
      offset: 0,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.lastFilters = initialFilters;

    this.fetchEvaluations(
      initialFilters,
    );
  }


  /* =========================
     DATE RANGE
  ========================= */

  private getDefaultDateRange(): {
    from: string;
    to: string;
  } {
    const today = new Date();

    const to =
      today
        .toISOString()
        .split('T')[0];

    const fromDate =
      new Date();

    fromDate.setDate(
      today.getDate() - 20,
    );

    const from =
      fromDate
        .toISOString()
        .split('T')[0];

    return {
      from,
      to,
    };
  }


  /* =========================
     STUDENT SEARCH
  ========================= */

  onStudentSearchChange(
    term: string,
  ): void {
    this.selectedStudent = null;
    this.selectedStudentId = undefined;

    this.studentSearchInput$
      .next(term);
  }


  fetchFilteredStudents(
    term: string,
  ): void {
    const query =
      term
        .trim()
        .toLowerCase();

    if (query.length < 2) {
      this.filteredStudents = [];
      this.showStudentDropdown = false;

      return;
    }

    this.usersService
      .searchUsers(
        0,
        20,
        undefined,
        query,
        query,
        undefined,
        UserRole.STUDENT,
      )
      .subscribe({
        next: (res) => {
          this.filteredStudents =
            res.users;

          this.showStudentDropdown =
            this.filteredStudents.length > 0;
        },

        error: () => {
          this.filteredStudents = [];
          this.showStudentDropdown = false;
        },
      });
  }


  onStudentSelected(
    user: UserDto,
  ): void {
    this.selectedStudent = user;

    this.selectedStudentId =
      user.student?.id;

    this.filteredStudents = [];
    this.showStudentDropdown = false;

    this.isStudentFieldInvalid = false;
  }


  hideStudentDropdown(): void {
    setTimeout(() => {
      this.showStudentDropdown = false;
    }, 200);
  }


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  onInstructorSearchChange(
    term: string,
  ): void {
    this.selectedInstructor = null;
    this.selectedInstructorId = undefined;

    this.instructorSearchInput$
      .next(term);
  }


  fetchFilteredInstructors(
    term: string,
  ): void {
    const query =
      term
        .trim()
        .toLowerCase();

    if (query.length < 2) {
      this.filteredInstructors = [];
      this.showInstructorDropdown = false;

      return;
    }

    this.usersService
      .searchUsers(
        0,
        20,
        undefined,
        query,
        query,
        undefined,
        UserRole.INSTRUCTOR,
      )
      .subscribe({
        next: (res) => {
          this.filteredInstructors =
            res.users;

          this.showInstructorDropdown =
            this.filteredInstructors.length > 0;
        },

        error: () => {
          this.filteredInstructors = [];
          this.showInstructorDropdown = false;
        },
      });
  }


  onInstructorSelected(
    user: UserDto,
  ): void {
    this.selectedInstructor = user;

    this.selectedInstructorId =
      user.instructor?.id;

    this.filteredInstructors = [];
    this.showInstructorDropdown = false;

    this.isInstructorFieldInvalid = false;
  }


  hideInstructorDropdown(): void {
    setTimeout(() => {
      this.showInstructorDropdown = false;
    }, 200);
  }


  /* =========================
     FILTERS
  ========================= */

  onFiltersSubmitted(
    filters: FilterEvaluationsDto,
  ): void {
    if (
      !filters.from ||
      !filters.to
    ) {
      this.showAutoCloseModal(
        {
          isInfo: true,
          message:
            'Debes seleccionar un rango de fechas',
        },
        3000,
      );

      return;
    }

    const studentId =
      this.selectedStudentId ??
      filters.studentId;

    const instructorId =
      this.selectedInstructorId ??
      filters.instructorId;

    this.showStudentColumn =
      !studentId;

    this.showInstructorColumn =
      !instructorId;

    this.page = 1;

    this.lastFilters = {
      ...filters,

      studentId:
        studentId || undefined,

      instructorId:
        instructorId || undefined,

      sortBy:
        this.sortBy,

      sortOrder:
        this.sortOrder,
    };

    this.fetchEvaluations(
      this.lastFilters,
    );
  }


  /* =========================
     SORT
  ========================= */

  changeSort(
    field: 'rating' | 'createdAt',
  ): void {
    if (this.sortBy === field) {
      this.sortOrder =
        this.sortOrder === 'asc'
          ? 'desc'
          : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'desc';
    }

    if (!this.lastFilters) {
      return;
    }

    const updatedFilters: FilterEvaluationsDto = {
      ...this.lastFilters,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.lastFilters =
      updatedFilters;

    this.fetchEvaluations(
      updatedFilters,
    );
  }


  /* =========================
     FETCH
  ========================= */

  private fetchEvaluations(
    filters: FilterEvaluationsDto,
  ): void {
    this.searchAttempted = true;
    this.isLoading = true;

    this.evaluations = [];
    this.selectedEvaluation = null;

    this.evaluationService
      .getEvaluations(filters)
      .subscribe({
        next: (
          evaluations,
        ) => {
          this.evaluations =
            evaluations;

          this.page = 1;
          this.isLoading = false;
        },

        error: () => {
          this.evaluations = [];
          this.isLoading = false;
        },
      });
  }


  /* =========================
     ACCEPTANCE
  ========================= */

  onAcceptanceToggled(
    event: {
      id: number;
      accepted: boolean;
    },
  ): void {
    this.updatingEvaluationId =
      event.id;

    this.evaluationService
      .updateEvaluationAcceptance(
        event.id,
        {
          accepted:
            event.accepted,
        },
      )
      .subscribe({
        next: (
          updatedEvaluation,
        ) => {
          const index =
            this.evaluations
              .findIndex(
                evaluation =>
                  evaluation.id ===
                  updatedEvaluation.id,
              );

          if (index !== -1) {
            this.evaluations[index] =
              updatedEvaluation;
          }

          this.updatingEvaluationId =
            null;
        },

        error: () => {
          this.updatingEvaluationId =
            null;

          this.showAutoCloseModal(
            {
              isError: true,
              message:
                'No se pudo actualizar la validación de la evaluación',
            },
            3000,
          );
        },
      });
  }


  /* =========================
     DETAIL
  ========================= */

  onEvaluationSelected(
    evaluation: InstructorEvaluation,
  ): void {
    this.selectedEvaluation =
      evaluation;

    this.showEvaluationModal =
      true;
  }


  closeEvaluationModal(): void {
    this.showEvaluationModal =
      false;

    this.selectedEvaluation =
      null;
  }


  /* =========================
     CREATE
  ========================= */

  openCreateEvaluationModal(): void {
    this.showCreateEvaluationModal =
      true;
  }


  closeCreateEvaluationModal(): void {
    this.showCreateEvaluationModal =
      false;
  }


  /* =========================
     SUMMARY
  ========================= */

  get totalEvaluations(): number {
    return this.evaluations.length;
  }


  get acceptedEvaluations(): number {
    return this.evaluations
      .filter(
        evaluation =>
          evaluation.accepted === true,
      )
      .length;
  }


  get rejectedEvaluations(): number {
    return this.evaluations
      .filter(
        evaluation =>
          evaluation.accepted === false,
      )
      .length;
  }


  get evaluationsWithObservation(): number {
    return this.evaluations
      .filter((evaluation) => {
        const value =
          evaluation as InstructorEvaluation & {
            observation?: string | null;
            observations?: string | null;
          };

        return !!(
          value.observation?.trim() ||
          value.observations?.trim()
        );
      })
      .length;
  }


  get averageRating(): number {
    if (!this.evaluations.length) {
      return 0;
    }

    const ratings =
      this.evaluations
        .map((evaluation) => {
          const value =
            evaluation as InstructorEvaluation & {
              rating?: number | null;
            };

          return Number(
            value.rating ?? 0,
          );
        })
        .filter(
          rating =>
            Number.isFinite(rating),
        );

    if (!ratings.length) {
      return 0;
    }

    const total =
      ratings.reduce(
        (sum, rating) =>
          sum + rating,
        0,
      );

    return Number(
      (
        total /
        ratings.length
      ).toFixed(1),
    );
  }


  get acceptedPercentage(): number {
    return this.getPercentage(
      this.acceptedEvaluations,
    );
  }


  get rejectedPercentage(): number {
    return this.getPercentage(
      this.rejectedEvaluations,
    );
  }


  get observationPercentage(): number {
    return this.getPercentage(
      this.evaluationsWithObservation,
    );
  }


  private getPercentage(
    value: number,
  ): number {
    if (!this.totalEvaluations) {
      return 0;
    }

    return Number(
      (
        (
          value /
          this.totalEvaluations
        ) * 100
      ).toFixed(1),
    );
  }


  /* =========================
     PAGINATION
  ========================= */

  get pagedEvaluations(): InstructorEvaluation[] {
    const start =
      (this.page - 1) *
      this.limit;

    return this.evaluations.slice(
      start,
      start + this.limit,
    );
  }


  get total(): number {
    return this.evaluations.length;
  }


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


  get startIndex(): number {
    if (!this.total) {
      return 0;
    }

    return (
      (this.page - 1) *
      this.limit
    ) + 1;
  }


  get endIndex(): number {
    return Math.min(
      this.page *
      this.limit,
      this.total,
    );
  }


  get paginationLabel(): string {
    if (!this.total) {
      return '0 evaluaciones';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} evaluaciones`
    );
  }


  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
  }


  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
  }


  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
  }


  onLimitChange(
    value: number,
  ): void {
    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limit = limit;
    this.page = 1;
  }


  /* =========================
     MODAL
  ========================= */

  private showAutoCloseModal(
    config: Partial<ModalDto>,
    duration = 3000,
  ): void {
    this.modal = {
      ...modalInitializer(),
      ...config,

      show: true,

      close: () => {
        this.modal.show = false;
      },
    };

    setTimeout(() => {
      this.modal.show = false;
    }, duration);
  }
}