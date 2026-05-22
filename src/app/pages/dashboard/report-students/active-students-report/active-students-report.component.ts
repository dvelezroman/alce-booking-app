import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  Subscription,
  expand,
  switchMap,
  takeWhile,
  timer,
} from 'rxjs';
import { ReportsService } from '../../../../services/reports.service';
import { StagesService } from '../../../../services/stages.service';
import { Stage } from '../../../../services/dtos/student.dto';
import { ActiveStudentsReportFiltersDto } from '../../../../services/dtos/reports.dto';

type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'downloaded';

@Component({
  selector: 'app-active-students-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './active-students-report.component.html',
  styleUrl: './active-students-report.component.scss',
})
export class ActiveStudentsReportComponent implements OnInit, OnDestroy {
  stages: Stage[] = [];
  stageId: number | null = null;
  noClasses = false;

  loading = false;
  downloading = false;
  error?: string;
  serverError?: string;

  jobId?: string;
  status?: JobStatus;
  rowCount?: number;
  fileName?: string;

  reportReady = false;
  progress = 0;

  private pollingSub?: Subscription;

  constructor(
    private reportsService: ReportsService,
    private stagesService: StagesService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.stagesService.getAll().subscribe({
      next: (data) => {
        this.stages = (data ?? []).filter((stage) => {
          const match = stage.number.match(/^STG\s*(\d+)/i);
          if (!match) return false;
          const num = Number(match[1]);
          return num >= 0 && num <= 19;
        });
      },
      error: () => {
        this.stages = [];
      },
    });

    const jobIdFromQuery = this.route.snapshot.queryParamMap.get('jobId');
    if (jobIdFromQuery) {
      this.jobId = jobIdFromQuery;
      this.loading = true;
      this.progress = 30;
      this.startPolling();
    }
  }

  generateReport(): void {
    this.resetState(false);
    this.loading = true;
    this.progress = 10;

    const filters: ActiveStudentsReportFiltersDto = {};
    if (this.stageId != null) {
      filters.stageId = this.stageId;
    }
    if (this.noClasses) {
      filters.noClasses = true;
    }

    this.reportsService.createActiveStudentsReportJob(filters).subscribe({
      next: (res) => {
        this.jobId = res.jobId;
        this.status = res.status as JobStatus;
        this.startPolling();
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al crear el reporte';
      },
    });
  }

  private startPolling(): void {
    if (!this.jobId) return;

    this.stopPolling();

    this.pollingSub = this.reportsService
      .getActiveStudentsReportJobStatus(this.jobId)
      .pipe(
        expand((res) => {
          if (res.status === 'completed' || res.status === 'failed') {
            return EMPTY;
          }
          return timer(3000).pipe(
            switchMap(() =>
              this.reportsService.getActiveStudentsReportJobStatus(
                this.jobId!,
              ),
            ),
          );
        }),
        takeWhile(
          (res) => res.status !== 'completed' && res.status !== 'failed',
          true,
        ),
      )
      .subscribe({
        next: (res) => {
          this.status = res.status as JobStatus;
          this.rowCount = res.rowCount;
          this.fileName = res.fileName;

          if (this.progress < 90 && res.status !== 'completed') {
            this.progress += 10;
          }

          if (res.status === 'completed') {
            this.progress = 100;
            this.loading = false;
            this.reportReady = true;
          }

          if (res.status === 'failed') {
            this.loading = false;
            this.serverError = res.errorMessage;
            this.error = 'No se pudo generar el reporte.';
          }
        },
        error: () => {
          this.loading = false;
          this.error = 'Error consultando el estado del reporte';
        },
      });
  }

  downloadReport(): void {
    if (!this.jobId || !this.reportReady) return;

    this.downloading = true;
    this.error = undefined;

    this.reportsService.downloadActiveStudentsReport(this.jobId).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.downloading = false;
          this.error = 'Archivo vacío';
          return;
        }

        const disposition = response.headers.get('Content-Disposition');
        let name = this.fileName ?? 'estudiantes-activos.xlsx';
        const match = disposition?.match(/filename="?([^"]+)"?/i);
        if (match?.[1]) {
          name = match[1];
        }

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        window.URL.revokeObjectURL(url);

        this.downloading = false;
        this.reportReady = false;
        this.status = 'downloaded';
      },
      error: (err) => {
        this.downloading = false;
        if (err?.status === 410) {
          this.error =
            'Este reporte ya fue descargado y eliminado del almacenamiento.';
          this.reportReady = false;
          this.status = 'downloaded';
          return;
        }
        this.error = 'Error al descargar el reporte';
      },
    });
  }

  private resetState(clearJobId = true): void {
    this.stopPolling();
    this.error = undefined;
    this.serverError = undefined;
    if (clearJobId) {
      this.jobId = undefined;
    }
    this.status = undefined;
    this.rowCount = undefined;
    this.fileName = undefined;
    this.reportReady = false;
    this.progress = 0;
  }

  private stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
