import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';

import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';
import { UsersService } from '../../../services/users.service';

import {
  EvaluationStatisticsFilterDto,
  EvaluationStatisticsResponse
} from '../../../services/dtos/instructor-evaluation.dto';

import {
  UserDto,
  UserRole
} from '../../../services/dtos/user.dto';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer
} from '../../../components/modal/modal.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { StatisticsHeaderComponent } from '../../../components/statistics/statistics-header/statistics-header.component';
import { StatisticsFiltersComponent } from '../../../components/statistics/statistics-filters/statistics-filters.component';
import { StatisticsSummaryComponent } from '../../../components/statistics/statistics-summary/statistics-summary.component';
import { StatisticsRatingDistributionComponent } from '../../../components/statistics/statistics-rating-distribution/statistics-rating-distribution.component';
import { StatisticsInstructorTableComponent } from '../../../components/statistics/statistics-instructor-table/statistics-instructor-table.component';
import { StatisticsPaginationComponent } from '../../../components/statistics/statistics-pagination/statistics-pagination.component';
import { StatisticsRatingBarChartComponent } from '../../../components/statistics/statistics-rating-bar-chart/statistics-rating-bar-chart.component';
import { StatisticsRatingRangeChartComponent } from '../../../components/statistics/statistics-rating-range-chart/statistics-rating-range-chart.component';
import { StatisticsInstructorDetailPanelComponent } from '../../../components/statistics/statistics-instructor-detail-panel/statistics-instructor-detail-panel.component';

@Component({
  selector: 'app-evaluation-statistics',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    StatisticsHeaderComponent,
    StatisticsFiltersComponent,
    StatisticsSummaryComponent,
    StatisticsRatingDistributionComponent,
    StatisticsInstructorTableComponent,
    StatisticsPaginationComponent,
    StatisticsRatingBarChartComponent,
    StatisticsRatingRangeChartComponent,
    StatisticsInstructorDetailPanelComponent
  ],
  templateUrl: './evaluation-statistics.component.html',
  styleUrl: './evaluation-statistics.component.scss'
})
export class EvaluationStatisticsComponent implements OnInit {

  /* =========================
     DATA
  ========================= */

  statistics: EvaluationStatisticsResponse | null = null;

  filteredInstructors: UserDto[] = [];

  selectedInstructorUser: UserDto | null = null;

  selectedInstructorId: number | undefined;


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  instructorSearchInput$ =
    new Subject<string>();

  showInstructorDropdown = false;

  isInstructorFieldInvalid = false;


  /* =========================
     UI STATE
  ========================= */

  searchAttempted = false;

  loading = false;

  modal: ModalDto =
    modalInitializer();


  /* =========================
     PAGINATION
  ========================= */

  page = 1;

  limit = 8;

  readonly limitOptions = [
    8,
    10,
    20,
    50
  ];


  /* =========================
     DETAIL
  ========================= */

  selectedInstructor:
    EvaluationStatisticsResponse['instructors'][number] | null = null;

  showInstructorDetail = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private evaluationService:
      InstructorEvaluationService,

    private usersService:
      UsersService
  ) {

    this.instructorSearchInput$
      .pipe(
        debounceTime(300)
      )
      .subscribe(
        (term: string) => {
          this.fetchFilteredInstructors(
            term
          );
        }
      );
  }


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {

    const {
      from,
      to
    } =
      this.getDefaultDateRange();

    this.fetchStatistics({
      from,
      to
    });
  }


  /* =========================
     DEFAULT RANGE
  ========================= */

  private getDefaultDateRange(): {
    from: string;
    to: string;
  } {

    const today =
      new Date();

    const to =
      today
        .toISOString()
        .split('T')[0];

    const fromDate =
      new Date();

    fromDate.setDate(
      today.getDate() - 20
    );

    const from =
      fromDate
        .toISOString()
        .split('T')[0];

    return {
      from,
      to
    };
  }


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  onInstructorSearchChange(
    term: string
  ): void {

    this.selectedInstructorUser =
      null;

    this.selectedInstructorId =
      undefined;

    this.instructorSearchInput$
      .next(term);
  }


  fetchFilteredInstructors(
    term: string
  ): void {

    const query =
      term
        .trim()
        .toLowerCase();

    if (
      query.length < 2
    ) {

      this.filteredInstructors = [];

      this.showInstructorDropdown =
        false;

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
        UserRole.INSTRUCTOR
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

          this.showInstructorDropdown =
            false;
        }

      });
  }


  onInstructorSelected(
    user: UserDto
  ): void {

    this.selectedInstructorUser =
      user;

    this.selectedInstructorId =
      user.instructor?.id;

    this.filteredInstructors = [];

    this.showInstructorDropdown =
      false;

    this.isInstructorFieldInvalid =
      false;
  }


  hideInstructorDropdown(): void {

    setTimeout(() => {

      this.showInstructorDropdown =
        false;

    }, 200);
  }


  /* =========================
     FILTERS
  ========================= */

  onFiltersSubmitted(
    filters:
      EvaluationStatisticsFilterDto
  ): void {

    if (
      !filters.from ||
      !filters.to
    ) {

      this.showAutoCloseModal(
        {
          isInfo: true,
          message:
            'Debes seleccionar un rango de fechas'
        },
        3000
      );

      return;
    }


    const instructorId =
      this.selectedInstructorId ??
      filters.instructorId;


    this.page = 1;


    this.fetchStatistics({
      ...filters,

      instructorId:
        instructorId || undefined
    });
  }


  /* =========================
     FETCH STATISTICS
  ========================= */

  private fetchStatistics(
    filters:
      EvaluationStatisticsFilterDto
  ): void {

    this.searchAttempted =
      true;

    this.loading =
      true;

    this.statistics =
      null;


    this.evaluationService
      .getEvaluationStatistics(
        filters
      )
      .subscribe({

        next: (res) => {

          this.statistics = {
            ...res,

            instructors:
              [...res.instructors]
                .sort(
                  (a, b) =>
                    b.averageRating -
                    a.averageRating
                )
          };

          this.loading =
            false;
        },

        error: () => {

          this.statistics =
            null;

          this.loading =
            false;
        }

      });
  }


  /* =========================
     PAGINATION
  ========================= */

  get instructors():
    EvaluationStatisticsResponse['instructors'] {

    return (
      this.statistics?.instructors ??
      []
    );
  }


  get paginatedInstructors():
    EvaluationStatisticsResponse['instructors'] {

    const start =
      (this.page - 1) *
      this.limit;

    return this.instructors.slice(
      start,
      start + this.limit
    );
  }


  get total(): number {

    return this.instructors.length;
  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit
      )
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
      this.total
    );
  }


  get paginationLabel(): string {

    if (!this.total) {
      return '0 instructores';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} instructores`
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
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page =
      page;
  }


  onLimitChange(
    value: number
  ): void {

    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limit =
      limit;

    this.page =
      1;
  }


  /* =========================
     INSTRUCTOR DETAIL
  ========================= */

  openInstructorDetail(
    instructor:
      EvaluationStatisticsResponse['instructors'][number]
  ): void {

    this.selectedInstructor =
      instructor;

    this.showInstructorDetail =
      true;
  }


  closeInstructorDetail(): void {

    this.showInstructorDetail =
      false;

    this.selectedInstructor =
      null;
  }


  /* =========================
     MODAL
  ========================= */

  private showAutoCloseModal(
    config: Partial<ModalDto>,
    duration = 3000
  ) {

    this.modal = {
      ...modalInitializer(),
      ...config,

      show: true,

      close: () => {
        this.modal.show =
          false;
      }
    };


    setTimeout(() => {

      this.modal.show =
        false;

    }, duration);
  }
}