import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

import { StudentsService } from '../../../services/students.service';
import { UsersService } from '../../../services/users.service';

import {
  StudentSuspensionHistory,
} from '../../../services/dtos/student.dto';

import {
  UserDto,
  UserRole,
} from '../../../services/dtos/user.dto';

import { SuspensionHistoryHeaderComponent } from '../../../components/suspension-history-v2/suspension-history-header/suspension-history-header.component';
import { SuspensionHistorySummaryComponent } from '../../../components/suspension-history-v2/suspension-history-summary/suspension-history-summary.component';
import { SuspensionHistoryFiltersComponent } from '../../../components/suspension-history-v2/suspension-history-filters/suspension-history-filters.component';
import { SuspensionHistoryStatusChartComponent } from '../../../components/suspension-history-v2/suspension-history-status-chart/suspension-history-status-chart.component';
import { SuspensionHistoryTableComponent } from '../../../components/suspension-history-v2/suspension-history-table/suspension-history-table.component';
import { SuspensionHistoryPaginationComponent } from '../../../components/suspension-history-v2/suspension-history-pagination/suspension-history-pagination.component';
import { SuspensionHistoryImportantInfoComponent } from '../../../components/suspension-history-v2/suspension-history-important-info/suspension-history-important-info.component';
import { SuspensionHistoryQuickActionsComponent } from '../../../components/suspension-history-v2/suspension-history-quick-actions/suspension-history-quick-actions.component';
import { SuspensionHistoryDetailModalComponent } from '../../../components/suspension-history-v2/suspension-history-detail-modal/suspension-history-detail-modal.component';

@Component({
  selector: 'app-suspension-history',
  standalone: true,
  imports: [
    CommonModule,
    SuspensionHistoryHeaderComponent,
    SuspensionHistorySummaryComponent,
    SuspensionHistoryFiltersComponent,
    SuspensionHistoryStatusChartComponent,
    SuspensionHistoryTableComponent,
    SuspensionHistoryPaginationComponent,
    SuspensionHistoryImportantInfoComponent,
    SuspensionHistoryQuickActionsComponent,
    SuspensionHistoryDetailModalComponent,
  ],
  templateUrl: './suspension-history.component.html',
  styleUrl: './suspension-history.component.scss',
})
export class SuspensionHistoryComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  suspensionHistory: StudentSuspensionHistory[] = [];

  loading = false;


  /* =========================
     FILTERS
  ========================= */

  filters: {
    studentId?: number;
    stageId?: number;
  } = {};


  /* =========================
     STUDENT SEARCH
  ========================= */

  filteredStudents: UserDto[] = [];

  selectedStudent: UserDto | null = null;

  selectedStudentId: number | null = null;

  studentSearchInput$ =
    new Subject<string>();

  showStudentDropdown = false;

  isStudentFieldInvalid = false;


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
    DETAIL MODAL
  ========================= */

  selectedSuspension:
    StudentSuspensionHistory | null = null;

  showSuspensionDetailModal = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private studentsService: StudentsService,
    private usersService: UsersService,
  ) {
    this.studentSearchInput$
      .pipe(
        debounceTime(300),
      )
      .subscribe(
        (term: string) => {
          this.fetchFilteredStudents(
            term,
          );
        },
      );
  }


  /* =========================
     LIFECYCLE
  ========================= */

  ngOnInit(): void {
    this.loadSuspensionHistory();
  }


  /* =========================
     STUDENT SEARCH
  ========================= */

  onStudentSearchChange(
    term: string,
  ): void {
    this.selectedStudent = null;
    this.selectedStudentId = null;

    this.isStudentFieldInvalid = false;

    this.studentSearchInput$
      .next(term);
  }


  private fetchFilteredStudents(
    term: string,
  ): void {
    const query =
      term
        .trim()
        .toLowerCase();

    if (
      query.length < 2
    ) {
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
            res.users ?? [];

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
    this.selectedStudent =
      user;

    this.selectedStudentId =
      user.student?.id
        ? Number(
            user.student.id,
          )
        : Number(
            user.id,
          );

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
     LOAD DATA
  ========================= */

  private loadSuspensionHistory(): void {
    this.loading = true;

    this.studentsService
      .getSuspensionHistory(
        this.filters,
      )
      .subscribe({
        next: (history) => {
          this.suspensionHistory =
            history || [];

          this.page = 1;
          this.loading = false;
        },

        error: (err) => {
          console.error(
            '[SuspensionHistory] Error cargando historial',
            err,
          );

          this.suspensionHistory = [];
          this.page = 1;
          this.loading = false;
        },
      });
  }


  /* =========================
     FILTERS FROM CHILD
  ========================= */

  onFiltersChange(
    filters: {
      studentId?: number;
      stageId?: number;
    },
  ): void {
    const studentId =
      this.selectedStudentId ??
      filters.studentId;

    this.filters = {
      ...filters,

      studentId:
        studentId ??
        undefined,
    };

    this.page = 1;

    this.loadSuspensionHistory();
  }


  /* =========================
     TABLE ACTIONS
  ========================= */

  onViewSuspension(
    item: StudentSuspensionHistory,
  ): void {
    this.selectedSuspension =
      item;

    this.showSuspensionDetailModal =
      true;
  }


closeSuspensionDetailModal(): void {
  this.showSuspensionDetailModal =
    false;

  this.selectedSuspension =
    null;
}


  onDownloadSuspension(
    item: StudentSuspensionHistory,
  ): void {
    console.log(
      '[SuspensionHistory] Descargar:',
      item,
    );
  }


  /* =========================
     PAGINATED DATA
  ========================= */

  get pagedSuspensionHistory():
    StudentSuspensionHistory[] {

    const start =
      (this.page - 1) *
      this.limit;

    return this.suspensionHistory.slice(
      start,
      start + this.limit,
    );
  }


  /* =========================
     TOTAL
  ========================= */

  get total(): number {
    return this.suspensionHistory.length;
  }


  /* =========================
     TOTAL PAGES
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


  /* =========================
     PREVIOUS / NEXT
  ========================= */

  get canPrev(): boolean {
    return this.page > 1;
  }


  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  /* =========================
     RANGE
  ========================= */

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


  /* =========================
     PAGINATION LABEL
  ========================= */

  get paginationLabel(): string {
    if (!this.total) {
      return '0 registros';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} registros`
    );
  }


  /* =========================
     PREVIOUS
  ========================= */

  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
  }


  /* =========================
     NEXT
  ========================= */

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
  }


  /* =========================
     PAGE CHANGE
  ========================= */

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


  /* =========================
     LIMIT CHANGE
  ========================= */

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
}