import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type ReportExcelHistoryType =
  | 'users'
  | 'absents'
  | 'without-meetings';

export interface ReportExcelHistoryItem {
  id: number;
  type: ReportExcelHistoryType;
  filename: string;
  generatedAt: string | Date;
  filters?: string;
  status?: 'completed' | 'error';
}

@Component({
  selector: 'app-report-excel-history',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-excel-history.component.html',
  styleUrl: './report-excel-history.component.scss',
})
export class ReportExcelHistoryComponent {

  @Input() reports:
    ReportExcelHistoryItem[] = [];

  @Output() downloadRequested =
    new EventEmitter<ReportExcelHistoryItem>();


  /* =========================
     TYPE
  ========================= */

  getTypeLabel(
    type: ReportExcelHistoryType,
  ): string {
    switch (type) {
      case 'absents':
        return 'Estudiantes ausentes';

      case 'without-meetings':
        return 'Sin clases agendadas';

      case 'users':
      default:
        return 'Usuarios';
    }
  }


  getTypeModifier(
    type: ReportExcelHistoryType,
  ):
    | 'users'
    | 'absents'
    | 'without' {

    switch (type) {
      case 'absents':
        return 'absents';

      case 'without-meetings':
        return 'without';

      case 'users':
      default:
        return 'users';
    }
  }


  /* =========================
     STATUS
  ========================= */

  getStatusLabel(
    status?: 'completed' | 'error',
  ): string {
    return status === 'error'
      ? 'Error'
      : 'Completado';
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value: string | Date,
  ): string {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  }


  formatTime(
    value: string | Date,
  ): string {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return date.toLocaleTimeString(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }


  /* =========================
     DOWNLOAD
  ========================= */

  onDownload(
    report: ReportExcelHistoryItem,
  ): void {
    this.downloadRequested.emit(
      report,
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByReportId(
    index: number,
    report: ReportExcelHistoryItem,
  ): number {
    return report.id ?? index;
  }
}