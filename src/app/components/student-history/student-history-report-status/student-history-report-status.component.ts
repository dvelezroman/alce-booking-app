import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

@Component({
  selector: 'app-student-history-report-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-history-report-status.component.html',
  styleUrl: './student-history-report-status.component.scss'
})
export class StudentHistoryReportStatusComponent {

  @Input() jobId?: string;

  @Input() status?: JobStatus;

  @Input() loading = false;

  @Input() progress = 0;

  @Input() reportReady = false;

  @Input() error?: string;

  @Input() serverError?: string;

  @Output() downloadRequested =
    new EventEmitter<void>();

  get hasStarted(): boolean {
    return !!this.jobId || !!this.status || this.loading;
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'queued':
        return 'En cola';

      case 'processing':
        return 'Procesando';

      case 'completed':
        return 'Completado';

      case 'failed':
        return 'Fallido';

      default:
        return 'Pendiente';
    }
  }

  get statusDescription(): string {
    switch (this.status) {
      case 'queued':
        return 'El reporte está en cola y comenzará a procesarse en breve.';

      case 'processing':
        return 'Estamos recopilando y procesando el historial del estudiante.';

      case 'completed':
        return 'El reporte fue generado correctamente y ya está disponible para descargar.';

      case 'failed':
        return 'No fue posible completar la generación del reporte.';

      default:
        return 'Genera un reporte para consultar aquí el estado del proceso.';
    }
  }

  get statusClass(): string {
    switch (this.status) {
      case 'queued':
        return 'report-status--queued';

      case 'processing':
        return 'report-status--processing';

      case 'completed':
        return 'report-status--completed';

      case 'failed':
        return 'report-status--failed';

      default:
        return 'report-status--idle';
    }
  }

  get safeProgress(): number {
    return Math.min(
      100,
      Math.max(
        0,
        Number(this.progress) || 0
      )
    );
  }

  get currentStep(): number {
    if (this.status === 'completed') return 3;

    if (
      this.status === 'processing' ||
      this.safeProgress >= 40
    ) {
      return 2;
    }

    if (
      this.status === 'queued' ||
      this.safeProgress > 0
    ) {
      return 1;
    }

    return 0;
  }

  onDownload(): void {
    if (!this.reportReady) return;

    this.downloadRequested.emit();
  }
}