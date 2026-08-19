import {
  Component,
  Input,
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
export class ReportInstructorDaySummaryComponent {

  @Input() summary:
    DailySummaryItem[] = [];

  @Input() instructorName = '';

  @Input() from = '';

  @Input() to = '';


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
      .from(groups.entries())
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
            `${a.date}T00:00:00`,
          ).getTime() -
          new Date(
            `${b.date}T00:00:00`,
          ).getTime(),
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
      new Date(
        `${value}T00:00:00`,
      );

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
      new Date(
        `${value}T00:00:00`,
      );

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

    if (!this.totalClasses) {
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