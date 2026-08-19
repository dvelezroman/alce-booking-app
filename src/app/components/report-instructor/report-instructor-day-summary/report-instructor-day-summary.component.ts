import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

interface DailySummaryItem {
  localdate: string;
  localhour: number;
  count: number;
}

interface DaySummaryGroup {
  date: string;
  total: number;
  hours: DailySummaryItem[];
}

@Component({
  selector: 'app-report-instructor-day-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-instructor-day-summary.component.html',
  styleUrl: './report-instructor-day-summary.component.scss',
})
export class ReportInstructorDaySummaryComponent implements OnChanges {

  @Input() summary:
    DailySummaryItem[] = [];

  @Input() instructorName = '';

  @Input() from = '';

  @Input() to = '';


  /* =========================
     PAGINATION
  ========================= */

  page = 1;

  limit = 5;

  readonly limitOptions:
    number[] = [
      5,
      10,
      20,
      50,
    ];


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['summary'] ||
      changes['instructorName'] ||
      changes['from'] ||
      changes['to']
    ) {
      this.page = 1;
    }
  }


  /* =========================
     GROUPED DATA
  ========================= */

  get groupedDays():
    DaySummaryGroup[] {

    const groups =
      new Map<
        string,
        DailySummaryItem[]
      >();

    this.summary.forEach(
      item => {

        if (!item.localdate) {
          return;
        }

        const current =
          groups.get(
            item.localdate,
          ) || [];

        current.push(
          item,
        );

        groups.set(
          item.localdate,
          current,
        );
      },
    );

    return Array
      .from(
        groups.entries(),
      )
      .map(
        ([date, hours]) => {

          const sortedHours =
            [...hours].sort(
              (a, b) =>
                Number(
                  a.localhour,
                ) -
                Number(
                  b.localhour,
                ),
            );

          return {
            date,

            total:
              sortedHours.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.count || 0,
                  ),
                0,
              ),

            hours:
              sortedHours,
          };
        },
      )
      .sort(
        (a, b) =>
          new Date(
            a.date,
          ).getTime() -
          new Date(
            b.date,
          ).getTime(),
      );
  }


  /* =========================
     PAGINATED DATA
  ========================= */

  get paginatedDays():
    DaySummaryGroup[] {

    const start =
      (
        this.page - 1
      ) * this.limit;

    return this.groupedDays.slice(
      start,
      start + this.limit,
    );
  }


  get totalPages(): number {

    if (
      !this.groupedDays.length
    ) {
      return 1;
    }

    return Math.ceil(
      this.groupedDays.length /
      this.limit,
    );
  }


  get canPreviousPage(): boolean {
    return this.page > 1;
  }


  get canNextPage(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  get startIndex(): number {

    if (
      !this.groupedDays.length
    ) {
      return 0;
    }

    return (
      (
        this.page - 1
      ) *
      this.limit
    ) + 1;
  }


  get endIndex(): number {

    return Math.min(
      this.page *
      this.limit,
      this.groupedDays.length,
    );
  }


  get paginationLabel(): string {

    if (
      !this.groupedDays.length
    ) {
      return '0 días';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.groupedDays.length} días`
    );
  }


  get visiblePages():
    (number | 'ellipsis')[] {

    if (
      this.totalPages <= 7
    ) {
      return Array.from(
        {
          length:
            this.totalPages,
        },
        (_, index) =>
          index + 1,
      );
    }

    if (
      this.page <= 4
    ) {
      return [
        1,
        2,
        3,
        4,
        5,
        'ellipsis',
        this.totalPages,
      ];
    }

    if (
      this.page >=
      this.totalPages - 3
    ) {
      return [
        1,
        'ellipsis',
        this.totalPages - 4,
        this.totalPages - 3,
        this.totalPages - 2,
        this.totalPages - 1,
        this.totalPages,
      ];
    }

    return [
      1,
      'ellipsis',
      this.page - 1,
      this.page,
      this.page + 1,
      'ellipsis',
      this.totalPages,
    ];
  }


  /* =========================
     PAGE ACTIONS
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


  onPreviousPage(): void {

    if (
      !this.canPreviousPage
    ) {
      return;
    }

    this.page--;
  }


  onNextPage(): void {

    if (
      !this.canNextPage
    ) {
      return;
    }

    this.page++;
  }


  onLimitChange(
    value: number | string,
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


  isPage(
    item:
      number |
      'ellipsis',
  ): item is number {

    return (
      typeof item === 'number'
    );
  }


  /* =========================
     TOTALS
  ========================= */

  get totalClasses(): number {

    return this.summary.reduce(
      (sum, item) =>
        sum +
        Number(
          item.count || 0,
        ),
      0,
    );
  }


  get totalDays(): number {
    return this.groupedDays.length;
  }


  get busiestDay():
    DaySummaryGroup | null {

    if (
      !this.groupedDays.length
    ) {
      return null;
    }

    return this.groupedDays.reduce(
      (best, current) =>
        current.total >
        best.total
          ? current
          : best,
    );
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value: string,
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    );
  }


  formatShortDate(
    value: string,
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  }


  /* =========================
     HOUR
  ========================= */

  formatHour(
    hour: number,
  ): string {

    const value =
      Number(hour);

    if (
      !Number.isFinite(value)
    ) {
      return '—';
    }

    const period =
      value >= 12
        ? 'PM'
        : 'AM';

    const normalized =
      value === 0
        ? 12
        : value > 12
          ? value - 12
          : value;

    return `${normalized}:00 ${period}`;
  }


  /* =========================
     RANGE
  ========================= */

  get rangeLabel(): string {

    if (
      !this.from &&
      !this.to
    ) {
      return 'Sin rango seleccionado';
    }

    if (
      this.from &&
      this.to
    ) {
      return (
        `${this.formatShortDate(this.from)} - ` +
        `${this.formatShortDate(this.to)}`
      );
    }

    return this.formatShortDate(
      this.from ||
      this.to,
    );
  }


  /* =========================
     BAR
  ========================= */

  getDayPercentage(
    day: DaySummaryGroup,
  ): number {

    if (
      !this.totalClasses
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (
          day.total /
          this.totalClasses
        ) * 100,
      ),
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByDay(
    index: number,
    day: DaySummaryGroup,
  ): string {
    return day.date;
  }


  trackByHour(
    index: number,
    item: DailySummaryItem,
  ): string {

    return (
      `${item.localdate}-` +
      `${item.localhour}-` +
      `${index}`
    );
  }
}