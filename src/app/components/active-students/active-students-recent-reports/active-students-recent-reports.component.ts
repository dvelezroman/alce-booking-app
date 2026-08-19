import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'downloaded';

export interface ActiveStudentsRecentReport {
  jobId: string;
  status: JobStatus;
  rowCount?: number | null;
  createdAt?: string | Date;
  completedAt?: string | Date;
  stageId?: number | null;
  noClasses?: boolean;
  fileName?: string;
}

@Component({
  selector: 'app-active-students-recent-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './active-students-recent-reports.component.html',
  styleUrl: './active-students-recent-reports.component.scss',
})
export class ActiveStudentsRecentReportsComponent {

  @Input() reports: ActiveStudentsRecentReport[] = [];

  @Input() page = 1;

  @Input() totalPages = 1;

  @Input() total = 0;

  @Input() startIndex = 0;

  @Input() endIndex = 0;

  @Input() limit = 5;

  @Input() limitOptions: number[] = [
    5,
    10,
    20,
    50,
  ];

  @Input() canPrev = false;

  @Input() canNext = false;

  @Input() paginationLabel = '';

  @Output() pageChange =
    new EventEmitter<number>();

  @Output() previousRequested =
    new EventEmitter<void>();

  @Output() nextRequested =
    new EventEmitter<void>();

  @Output() limitChange =
    new EventEmitter<number>();


  get pages(): number[] {
    const total =
      Math.max(
        1,
        this.totalPages,
      );

    const current =
      Math.min(
        Math.max(
          1,
          this.page,
        ),
        total,
      );

    const start =
      Math.max(
        1,
        Math.min(
          current - 2,
          total - 4,
        ),
      );

    const end =
      Math.min(
        total,
        start + 4,
      );

    const pages: number[] = [];

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  }


  onPrevious(): void {
    if (!this.canPrev) {
      return;
    }

    this.previousRequested.emit();
  }


  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.nextRequested.emit();
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

    this.pageChange.emit(
      page,
    );
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

    this.limitChange.emit(
      limit,
    );
  }


  copyJobId(
    jobId: string,
  ): void {
    if (!jobId) {
      return;
    }

    navigator.clipboard.writeText(
      jobId,
    );
  }


  getStageLabel(
    report: ActiveStudentsRecentReport,
  ): string {
    return report.stageId != null
      ? `STG ${report.stageId}`
      : 'Todos';
  }


  getNoClassesLabel(
    report: ActiveStudentsRecentReport,
  ): string {
    return report.noClasses
      ? 'Sí'
      : 'No';
  }


  getStatusLabel(
    status: JobStatus,
  ): string {
    switch (status) {
      case 'queued':
        return 'Queued';

      case 'processing':
        return 'Processing';

      case 'completed':
        return 'Completed';

      case 'failed':
        return 'Failed';

      case 'downloaded':
        return 'Downloaded';

      default:
        return '—';
    }
  }


  getStatusClass(
    status: JobStatus,
  ): string {
    return (
      `recent-status--${status}`
    );
  }


  formatRows(
    value?: number | null,
  ): string {
    if (
      value === null ||
      value === undefined
    ) {
      return '—';
    }

    return new Intl.NumberFormat(
      'en-US',
    ).format(value);
  }


  formatDate(
    value?: string | Date,
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
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  }


  formatTime(
    value?: string | Date,
  ): string {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(date);
  }
}