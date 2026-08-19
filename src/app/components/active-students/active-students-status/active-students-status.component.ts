import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'downloaded';

@Component({
  selector: 'app-active-students-status',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './active-students-status.component.html',
  styleUrl: './active-students-status.component.scss',
})
export class ActiveStudentsStatusComponent {

  @Input() jobId?: string;
  @Input() status?: JobStatus;
  @Input() rowCount?: number;
  @Input() fileName?: string;

  @Input() loading = false;
  @Input() downloading = false;
  @Input() reportReady = false;

  @Input() progress = 0;

  @Input() error?: string;
  @Input() serverError?: string;

  @Output() downloadRequested =
    new EventEmitter<void>();


  onDownload(): void {
    if (
      !this.reportReady ||
      this.downloading
    ) {
      return;
    }

    this.downloadRequested.emit();
  }


  get normalizedProgress(): number {
    return Math.min(
      100,
      Math.max(
        0,
        Number(this.progress || 0),
      ),
    );
  }


  get progressDashArray(): string {
    const circumference = 289.03;

    const progress =
      (
        this.normalizedProgress /
        100
      ) *
      circumference;

    return `${progress} ${circumference}`;
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

      case 'downloaded':
        return 'Descargado';

      default:
        return 'Sin iniciar';
    }
  }


  get statusClass(): string {
    switch (this.status) {
      case 'queued':
        return 'active-status__badge--queued';

      case 'processing':
        return 'active-status__badge--processing';

      case 'completed':
        return 'active-status__badge--completed';

      case 'failed':
        return 'active-status__badge--failed';

      case 'downloaded':
        return 'active-status__badge--downloaded';

      default:
        return 'active-status__badge--idle';
    }
  }


  get receivedCompleted(): boolean {
    return !!this.status;
  }


  get processingActive(): boolean {
    return (
      this.status === 'queued' ||
      this.status === 'processing'
    );
  }


  get processingCompleted(): boolean {
    return (
      this.status === 'completed' ||
      this.status === 'downloaded'
    );
  }


  get finalizingActive(): boolean {
    return (
      this.status === 'processing' &&
      this.normalizedProgress >= 70
    );
  }


  get finalizingCompleted(): boolean {
    return (
      this.status === 'completed' ||
      this.status === 'downloaded'
    );
  }


  get readyCompleted(): boolean {
    return (
      this.status === 'completed' ||
      this.status === 'downloaded'
    );
  }


  get hasStarted(): boolean {
    return (
      !!this.jobId ||
      !!this.status ||
      this.loading ||
      this.normalizedProgress > 0
    );
  }


  get formattedRows(): string {
    if (
      this.rowCount === null ||
      this.rowCount === undefined
    ) {
      return '—';
    }

    return new Intl.NumberFormat(
      'en-US',
    ).format(
      this.rowCount,
    );
  }

  copyJobId(): void {
  if (!this.jobId) {
    return;
  }

  navigator.clipboard.writeText(
    this.jobId,
  );
}
}