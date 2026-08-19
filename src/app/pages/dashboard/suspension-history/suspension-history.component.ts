import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentsService } from '../../../services/students.service';
import { StudentSuspensionHistory } from '../../../services/dtos/student.dto';

import { SuspensionHistoryHeaderComponent } from '../../../components/suspension-history-v2/suspension-history-header/suspension-history-header.component';
import { SuspensionHistorySummaryComponent } from '../../../components/suspension-history-v2/suspension-history-summary/suspension-history-summary.component';
import { SuspensionHistoryFiltersComponent } from '../../../components/suspension-history-v2/suspension-history-filters/suspension-history-filters.component';
import { SuspensionHistoryStatusChartComponent } from '../../../components/suspension-history-v2/suspension-history-status-chart/suspension-history-status-chart.component';
import { SuspensionHistoryTableComponent } from '../../../components/suspension-history-v2/suspension-history-table/suspension-history-table.component';
import { SuspensionHistoryPaginationComponent } from '../../../components/suspension-history-v2/suspension-history-pagination/suspension-history-pagination.component';
import { SuspensionHistoryImportantInfoComponent } from '../../../components/suspension-history-v2/suspension-history-important-info/suspension-history-important-info.component';
import { SuspensionHistoryQuickActionsComponent } from '../../../components/suspension-history-v2/suspension-history-quick-actions/suspension-history-quick-actions.component';

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
    SuspensionHistoryQuickActionsComponent
  ],
  templateUrl: './suspension-history.component.html',
  styleUrl: './suspension-history.component.scss',
})
export class SuspensionHistoryComponent implements OnInit {

  // ============================
  // STATE
  // ============================

  suspensionHistory: StudentSuspensionHistory[] = [];
  loading = false;

  filters: {
    studentId?: number;
    stageId?: number;
  } = {};

  // ============================
  // PAGINATION
  // ============================

  page = 1;
  limit = 10;

  readonly limitOptions = [
    5,
    10,
    20,
    50,
  ];

  constructor(
    private studentsService: StudentsService
  ) {}

  // ============================
  // LIFECYCLE
  // ============================

  ngOnInit(): void {
    this.loadSuspensionHistory();
  }

  // ============================
  // LOAD DATA
  // ============================

  private loadSuspensionHistory(): void {
    this.loading = true;

    this.studentsService
      .getSuspensionHistory(this.filters)
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
            err
          );

          this.suspensionHistory = [];
          this.page = 1;
          this.loading = false;
        },
      });
  }

  // ============================
  // FILTERS FROM CHILD
  // ============================

  onFiltersChange(filters: {
    studentId?: number;
    stageId?: number;
  }) {
    this.filters = {
      ...filters
    };

    this.page = 1;

    this.loadSuspensionHistory();
  }

  // ============================
  // PAGINATED DATA
  // ============================

  get pagedSuspensionHistory(): StudentSuspensionHistory[] {
    const start =
      (this.page - 1) *
      this.limit;

    return this.suspensionHistory.slice(
      start,
      start + this.limit,
    );
  }

  // ============================
  // TOTAL
  // ============================

  get total(): number {
    return this.suspensionHistory.length;
  }

  // ============================
  // TOTAL PAGES
  // ============================

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit,
      ),
    );
  }

  // ============================
  // PREVIOUS / NEXT
  // ============================

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }

  // ============================
  // RANGE
  // ============================

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

  // ============================
  // PAGINATION LABEL
  // ============================

  get paginationLabel(): string {
    if (!this.total) {
      return '0 registros';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} registros`
    );
  }

  // ============================
  // PREVIOUS
  // ============================

  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
  }

  // ============================
  // NEXT
  // ============================

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
  }

  // ============================
  // PAGE CHANGE
  // ============================

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

  // ============================
  // LIMIT CHANGE
  // ============================

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