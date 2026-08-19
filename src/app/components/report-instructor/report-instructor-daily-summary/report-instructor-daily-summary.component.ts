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

@Component({
  selector: 'app-report-instructor-daily-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-instructor-daily-summary.component.html',
  styleUrl: './report-instructor-daily-summary.component.scss',
})
export class ReportInstructorDailySummaryComponent {

  @Input() summary:
    DailySummaryItem[] = [];

  @Input() instructorName = '';

  @Input() from = '';

  @Input() to = '';

  /* =========================
     SORTED
  ========================= */

  get sortedSummary():
    DailySummaryItem[] {

    return [
      ...this.summary,
    ].sort((a, b) => {

      const dateA =
        new Date(
          `${a.localdate}T00:00:00`,
        ).getTime();

      const dateB =
        new Date(
          `${b.localdate}T00:00:00`,
        ).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return (
        Number(a.localhour) -
        Number(b.localhour)
      );
    });
  }

  /* =========================
     TOTAL
  ========================= */

  get totalClasses(): number {
    return this.summary.reduce(
      (total, item) =>
        total + Number(item.count || 0),
      0,
    );
  }

  get totalDays(): number {
    return new Set(
      this.summary
        .map(item => item.localdate)
        .filter(Boolean),
    ).size;
  }

  get averagePerDay(): number {
    if (!this.totalDays) {
      return 0;
    }

    return Number(
      (
        this.totalClasses /
        this.totalDays
      ).toFixed(1),
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
        weekday: 'short',
        day: '2-digit',
        month: 'short',
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

    if (!this.from && !this.to) {
      return 'Sin rango seleccionado';
    }

    if (this.from && this.to) {
      return (
        `${this.formatShortDate(this.from)} - ` +
        `${this.formatShortDate(this.to)}`
      );
    }

    return this.formatShortDate(
      this.from || this.to,
    );
  }

  /* =========================
     TRACK
  ========================= */

  trackBySummary(
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