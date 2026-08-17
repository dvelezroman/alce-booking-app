import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
} from 'rxjs';

import {
  StageAssessment,
  StageAssessmentFilters,
  StageAssessmentStudent,
} from '../../../services/dtos/stage-assessment.dto';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { UsersService } from '../../../services/users.service';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS V2
========================= */

import { StageAssessmentListHeaderComponent } from '../../../components/stage-assessment-list-v2/stage-assessment-list-header/stage-assessment-list-header.component';
import { StageAssessmentListSummaryComponent } from '../../../components/stage-assessment-list-v2/stage-assessment-list-summary/stage-assessment-list-summary.component';
import { StageAssessmentListFiltersComponent } from '../../../components/stage-assessment-list-v2/stage-assessment-list-filters/stage-assessment-list-filters.component';
import { StageAssessmentListTableComponent } from '../../../components/stage-assessment-list-v2/stage-assessment-list-table/stage-assessment-list-table.component';
import { StageAssessmentListPaginationComponent } from '../../../components/stage-assessment-list-v2/stage-assessment-list-pagination/stage-assessment-list-pagination.component';
import { StageAssessmentStudentsModalComponent } from '../../../components/stage-assessment-list-v2/stage-assessment-students-modal/stage-assessment-students-modal.component';


@Component({
  selector: 'app-stage-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    StageAssessmentListHeaderComponent,
    StageAssessmentListSummaryComponent,
    StageAssessmentListFiltersComponent,
    StageAssessmentListTableComponent,
    StageAssessmentListPaginationComponent,
    StageAssessmentStudentsModalComponent,
  ],
  templateUrl: './stage-assessment-list.component.html',
  styleUrl: './stage-assessment-list.component.scss',
})
export class StageAssessmentListComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  assessments: StageAssessment[] = [];
  filteredAssessments: StageAssessment[] = [];
  pagedAssessments: StageAssessment[] = [];
  loading = false;


  /* =========================
     FILTERS
  ========================= */

  filters: StageAssessmentFilters = {};
  showFilters = false;

  searchTerm = '';
  filteredUsers: UserDto[] = [];
  showUserDropdown = false;

  private searchInput$ =
    new Subject<string>();


  /* =========================
     PAGINATION
  ========================= */

  page = 1;
  limit = 20;
  total = 0;

  readonly limitOptions = [
    10,
    20,
    50,
    100,
  ];


  /* =========================
     STUDENTS MODAL
  ========================= */

  showModal = false;
  modalTitle = '';
  modalUsers: StageAssessmentStudent[] = [];


  /* =========================
     DELETE MODAL
  ========================= */

  modal: ModalDto = modalInitializer();
  assessmentToDelete: StageAssessment | null = null;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private stageAssessmentService: StageAssessmentService,
    private usersService: UsersService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.fetchAssessments();

    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(
        term =>
          this.filterUsers(term),
      );
  }


  /* =========================
     FETCH
  ========================= */

  fetchAssessments(
    filters: StageAssessmentFilters = {},
  ): void {
    this.loading = true;

    this.stageAssessmentService
      .getAll(filters)
      .subscribe({
        next: (res) => {
          this.assessments = res || [];
          this.filteredAssessments = [
            ...this.assessments,
          ];

          this.total =
            this.filteredAssessments.length;

          this.page = 1;

          this.updatePagedAssessments();

          this.loading = false;
        },

        error: () => {
          this.assessments = [];
          this.filteredAssessments = [];
          this.pagedAssessments = [];

          this.total = 0;
          this.page = 1;
          this.loading = false;
        },
      });
  }


  /* =========================
     FILTERS
  ========================= */

  onFiltersChanged(
    filters: StageAssessmentFilters,
  ): void {
    /*
     * Conservamos el estudiante seleccionado
     * desde el buscador del padre.
     */
    this.filters = {
      ...filters,
      ...(this.filters.studentId
        ? {
            studentId:
              this.filters.studentId,
          }
        : {}),
    };

    this.fetchAssessments(
      this.filters,
    );
  }


  toggleFilters(): void {
    this.showFilters =
      !this.showFilters;
  }


  /* =========================
     USER INPUT
  ========================= */

  onUserInputChange(
    term: string,
  ): void {
    this.searchTerm =
      term || '';

    /*
     * Si ya había un estudiante seleccionado
     * y el usuario modifica el texto,
     * eliminamos el studentId anterior.
     */
    if (this.filters.studentId) {
      this.filters = {
        ...this.filters,
        studentId: undefined,
      };
    }

    this.searchInput$.next(
      this.searchTerm,
    );
  }


  /* =========================
     SELECT USER
  ========================= */

  selectUser(
    user: UserDto,
  ): void {
    const studentId =
      user.student?.id;

    if (!studentId) {
      return;
    }

    this.searchTerm =
      `${user.firstName || ''} ${user.lastName || ''}`
        .trim();

    this.filters = {
      ...this.filters,
      studentId,
    };

    this.filteredUsers = [];
    this.showUserDropdown = false;
  }


  /* =========================
     HIDE USER DROPDOWN
  ========================= */

  hideUserDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }


  /* =========================
     FILTER USERS
  ========================= */

  filterUsers(
    term: string,
  ): void {
    const value =
      term?.trim();

    if (
      !value ||
      value.length < 2
    ) {
      this.filteredUsers = [];
      this.showUserDropdown = false;

      return;
    }

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        value,
        value,
        undefined,
      )
      .subscribe({
        next: (result) => {
          /*
           * Solo mostramos usuarios que realmente
           * tienen perfil de estudiante.
           */
          this.filteredUsers =
            (result.users || [])
              .filter(
                user =>
                  !!user.student?.id,
              );

          this.showUserDropdown =
            this.filteredUsers.length > 0;
        },

        error: (error) => {
          console.error(
            'Error al buscar estudiantes:',
            error,
          );

          this.filteredUsers = [];
          this.showUserDropdown = false;
        },
      });
  }


  /* =========================
     CLEAR FILTERS
  ========================= */

  clearFilters(): void {
    this.filters = {};

    this.searchTerm = '';
    this.filteredUsers = [];
    this.showUserDropdown = false;

    this.fetchAssessments();
  }


  /* =========================
     ASSIGNED
  ========================= */

  onAssigned(
    assessment: StageAssessment,
  ): void {
    this.modalTitle =
      'Estudiantes asignados';

    this.modalUsers =
      assessment.students ?? [];

    this.showModal = true;
  }


  /* =========================
     FINISHED
  ========================= */

  onFinished(
    assessment: StageAssessment,
  ): void {
    this.modalTitle =
      'Estudiantes que finalizaron';

    this.modalUsers =
      assessment.students?.filter(
        student =>
          assessment.finished.includes(
            student.studentId,
          ),
      ) ?? [];

    this.showModal = true;
  }


  /* =========================
     CLOSE MODAL
  ========================= */

  closeModal(): void {
    this.showModal = false;
    this.modalUsers = [];
  }


  /* =========================
     DELETE
  ========================= */

  onDeleteAssessment(
    assessment: StageAssessment,
  ): void {
    this.assessmentToDelete =
      assessment;

    this.modal = {
      ...modalInitializer(),
      show: true,
      message:
        '¿Deseas eliminar esta evaluación?',
      isError: false,
      isSuccess: false,
      isInfo: true,
      showButtons: true,
      confirm: () =>
        this.confirmDelete(),
      close: () =>
        this.modal.show = false,
    };
  }


  confirmDelete(): void {
    if (!this.assessmentToDelete) {
      return;
    }

    this.stageAssessmentService
      .delete(
        this.assessmentToDelete.id,
      )
      .subscribe({
        next: () => {
          this.modal = {
            ...modalInitializer(),
            show: true,
            message:
              'Evaluación eliminada correctamente.',
            isSuccess: true,
            close: () =>
              this.modal.show = false,
          };

          this.assessmentToDelete = null;

          this.fetchAssessments(
            this.filters,
          );
        },

        error: () => {
          this.modal = {
            ...modalInitializer(),
            show: true,
            message:
              'No se pudo eliminar la evaluación.',
            isError: true,
            close: () =>
              this.modal.show = false,
          };
        },
      });
  }


  /* =========================
     PAGINATION
  ========================= */

  updatePagedAssessments(): void {
    const start =
      (this.page - 1) *
      this.limit;

    this.pagedAssessments =
      this.filteredAssessments.slice(
        start,
        start + this.limit,
      );
  }


  onPrev(): void {
    if (this.page <= 1) {
      return;
    }

    this.page--;

    this.updatePagedAssessments();
  }


  onNext(): void {
    if (
      this.page >=
      this.totalPages
    ) {
      return;
    }

    this.page++;

    this.updatePagedAssessments();
  }


  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.page = page;

    this.updatePagedAssessments();
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

    this.updatePagedAssessments();
  }


  /* =========================
     PAGINATION STATE
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
      `Mostrando ${this.startIndex} ` +
      `a ${this.endIndex} ` +
      `de ${this.total} evaluaciones`
    );
  }


  /* =========================
     SUMMARY
  ========================= */

  get totalAssessments(): number {
    return this.assessments.length;
  }


  get totalAssignedStudents(): number {
    return this.assessments.reduce(
      (total, assessment) =>
        total +
        (
          assessment.studentIds
            ?.length ||
          0
        ),
      0,
    );
  }


  get totalFinishedStudents(): number {
    return this.assessments.reduce(
      (total, assessment) =>
        total +
        (
          assessment.finished
            ?.length ||
          0
        ),
      0,
    );
  }


  get totalPastDueAssessments(): number {
    return this.assessments.filter(
      assessment =>
        assessment.isPastDue === true,
    ).length;
  }
}