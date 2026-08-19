import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

export interface RecentStudentHistoryReport {
  id: string;
  studentName: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  url?: string;
}

@Component({
  selector: 'app-student-history-recent-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-history-recent-reports.component.html',
  styleUrl: './student-history-recent-reports.component.scss'
})
export class StudentHistoryRecentReportsComponent {
  @Input() reports: RecentStudentHistoryReport[] = [];

  @Output() downloadRequested =
    new EventEmitter<RecentStudentHistoryReport>();

  getStatusLabel(
    status: RecentStudentHistoryReport['status']
  ): string {
    switch (status) {
      case 'completed':
        return 'Completado';

      case 'processing':
        return 'Procesando';

      case 'failed':
        return 'Fallido';

      default:
        return 'Sin estado';
    }
  }

  getStatusClass(
    status: RecentStudentHistoryReport['status']
  ): string {
    return `recent-report__status--${status}`;
  }

  formatDate(value: string): string {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  onDownload(
    report: RecentStudentHistoryReport
  ): void {
    if (
      report.status !== 'completed' ||
      !report.url
    ) {
      return;
    }

    this.downloadRequested.emit(report);
  }
}