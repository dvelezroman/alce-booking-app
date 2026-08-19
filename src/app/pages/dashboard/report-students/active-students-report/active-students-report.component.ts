import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
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

import {
  Stage,
} from '../../../../services/dtos/student.dto';

import {
  ActiveStudentsReportFiltersDto,
} from '../../../../services/dtos/reports.dto';


/* =========================
   CHILD COMPONENTS
========================= */

import {
  ActiveStudentsHeaderComponent,
} from '../../../../components/active-students/active-students-header/active-students-header.component';

import {
  ActiveStudentsFiltersComponent,
} from '../../../../components/active-students/active-students-filters/active-students-filters.component';

import {
  ActiveStudentsStatusComponent,
} from '../../../../components/active-students/active-students-status/active-students-status.component';

import {
  ActiveStudentsRecentReportsComponent,
} from '../../../../components/active-students/active-students-recent-reports/active-students-recent-reports.component';

import {
  ActiveStudentsHowItWorksComponent,
} from '../../../../components/active-students/active-students-how-it-works/active-students-how-it-works.component';

import {
  ActiveStudentsImportantInfoComponent,
} from '../../../../components/active-students/active-students-important-info/active-students-important-info.component';

import {
  ActiveStudentsStatusLegendComponent,
} from '../../../../components/active-students/active-students-status-legend/active-students-status-legend.component';


type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'downloaded';


@Component({
  selector: 'app-active-students-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ActiveStudentsHeaderComponent,
    ActiveStudentsFiltersComponent,
    ActiveStudentsStatusComponent,
    ActiveStudentsRecentReportsComponent,
    ActiveStudentsHowItWorksComponent,
    ActiveStudentsImportantInfoComponent,
    ActiveStudentsStatusLegendComponent,
  ],
  templateUrl: './active-students-report.component.html',
  styleUrl: './active-students-report.component.scss',
})
export class ActiveStudentsReportComponent
  implements OnInit, OnDestroy {

  /* =========================
     FILTERS
  ========================= */

  stages: Stage[] = [];

  stageId: number | null = null;

  noClasses = false;


  /* =========================
     STATE
  ========================= */

  loading = false;

  downloading = false;

  error?: string;

  serverError?: string;


  /* =========================
     JOB
  ========================= */

  jobId?: string;

  status?: JobStatus;

  rowCount?: number;

  fileName?: string;

  reportReady = false;

  progress = 0;

  private pollingSub?: Subscription;


  /* =========================
     RECENT REPORTS
  ========================= */

  recentReports: any[] = [];


  /* =========================
     PAGINATION
  ========================= */

  page = 1;

  limit = 5;

  readonly limitOptions = [
    5,
    10,
    20,
    50,
  ];


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private reportsService: ReportsService,
    private stagesService: StagesService,
    private route: ActivatedRoute,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {

    this.stagesService
      .getAll()
      .subscribe({
        next: (data) => {

          this.stages =
            (data ?? [])
              .filter((stage) => {

                const match =
                  stage.number.match(
                    /^STG\s*(\d+)/i,
                  );

                if (!match) {
                  return false;
                }

                const num =
                  Number(match[1]);

                return (
                  num >= 0 &&
                  num <= 19
                );
              });
        },

        error: () => {
          this.stages = [];
        },
      });


    const jobIdFromQuery =
      this.route
        .snapshot
        .queryParamMap
        .get('jobId');

    if (jobIdFromQuery) {

      this.jobId =
        jobIdFromQuery;

      this.loading =
        true;

      this.progress =
        30;

      this.startPolling();
    }
  }


  /* =========================
     GENERATE REPORT
  ========================= */

  generateReport(): void {

    this.resetState(false);

    this.loading =
      true;

    this.progress =
      10;


    const filters:
      ActiveStudentsReportFiltersDto = {};


    if (
      this.stageId != null
    ) {
      filters.stageId =
        this.stageId;
    }


    if (
      this.noClasses
    ) {
      filters.noClasses =
        true;
    }


    this.reportsService
      .createActiveStudentsReportJob(
        filters,
      )
      .subscribe({
        next: (res) => {

          this.jobId =
            res.jobId;

          this.status =
            res.status as JobStatus;

          this.startPolling();
        },

        error: () => {

          this.loading =
            false;

          this.error =
            'Error al crear el reporte';
        },
      });
  }


  /* =========================
     POLLING
  ========================= */

  private startPolling(): void {

    if (!this.jobId) {
      return;
    }

    this.stopPolling();


    this.pollingSub =
      this.reportsService
        .getActiveStudentsReportJobStatus(
          this.jobId,
        )
        .pipe(

          expand((res) => {

            if (
              res.status === 'completed' ||
              res.status === 'failed'
            ) {
              return EMPTY;
            }

            return timer(3000)
              .pipe(
                switchMap(() =>
                  this.reportsService
                    .getActiveStudentsReportJobStatus(
                      this.jobId!,
                    ),
                ),
              );
          }),

          takeWhile(
            (res) =>
              res.status !== 'completed' &&
              res.status !== 'failed',
            true,
          ),
        )
        .subscribe({

          next: (res) => {

            this.status =
              res.status as JobStatus;

            this.rowCount =
              res.rowCount;

            this.fileName =
              res.fileName;


            if (
              this.progress < 90 &&
              res.status !== 'completed'
            ) {
              this.progress += 10;
            }


            if (
              res.status === 'completed'
            ) {
              this.progress =
                100;

              this.loading =
                false;

              this.reportReady =
                true;
            }


            if (
              res.status === 'failed'
            ) {
              this.loading =
                false;

              this.serverError =
                res.errorMessage;

              this.error =
                'No se pudo generar el reporte.';
            }
          },

          error: () => {

            this.loading =
              false;

            this.error =
              'Error consultando el estado del reporte';
          },
        });
  }


  /* =========================
     DOWNLOAD
  ========================= */

  downloadReport(): void {

    if (
      !this.jobId ||
      !this.reportReady
    ) {
      return;
    }


    this.downloading =
      true;

    this.error =
      undefined;


    this.reportsService
      .downloadActiveStudentsReport(
        this.jobId,
      )
      .subscribe({

        next: (response) => {

          const blob =
            response.body;


          if (!blob) {

            this.downloading =
              false;

            this.error =
              'Archivo vacío';

            return;
          }


          const disposition =
            response.headers.get(
              'Content-Disposition',
            );


          let name =
            this.fileName ??
            'estudiantes-activos.xlsx';


          const match =
            disposition?.match(
              /filename="?([^"]+)"?/i,
            );


          if (match?.[1]) {
            name =
              match[1];
          }


          const url =
            window.URL
              .createObjectURL(
                blob,
              );


          const anchor =
            document
              .createElement('a');


          anchor.href =
            url;

          anchor.download =
            name;

          anchor.click();


          window.URL
            .revokeObjectURL(
              url,
            );


          this.downloading =
            false;

          this.reportReady =
            false;

          this.status =
            'downloaded';
        },

        error: (err) => {

          this.downloading =
            false;


          if (
            err?.status === 410
          ) {

            this.error =
              'Este reporte ya fue descargado y eliminado del almacenamiento.';

            this.reportReady =
              false;

            this.status =
              'downloaded';

            return;
          }


          this.error =
            'Error al descargar el reporte';
        },
      });
  }


  /* =========================
     PAGINATION
  ========================= */

  get pagedRecentReports(): any[] {

    const start =
      (this.page - 1) *
      this.limit;

    return this.recentReports.slice(
      start,
      start + this.limit,
    );
  }


  get total(): number {
    return this.recentReports.length;
  }


  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit,
      ),
    );
  }


  get canPrev(): boolean {
    return this.page > 1;
  }


  get canNext(): boolean {

    return (
      this.page <
      this.totalPages
    );
  }


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


  get paginationLabel(): string {

    if (!this.total) {
      return '0 reportes';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} reportes`
    );
  }


  onPrev(): void {

    if (!this.canPrev) {
      return;
    }

    this.page--;
  }


  onNext(): void {

    if (!this.canNext) {
      return;
    }

    this.page++;
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

    this.page =
      page;
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

    this.limit =
      limit;

    this.page =
      1;
  }


  /* =========================
     RESET
  ========================= */

  private resetState(
    clearJobId = true,
  ): void {

    this.stopPolling();

    this.error =
      undefined;

    this.serverError =
      undefined;


    if (clearJobId) {
      this.jobId =
        undefined;
    }


    this.status =
      undefined;

    this.rowCount =
      undefined;

    this.fileName =
      undefined;

    this.reportReady =
      false;

    this.progress =
      0;
  }


  /* =========================
     STOP POLLING
  ========================= */

  private stopPolling(): void {

    if (
      this.pollingSub
    ) {

      this.pollingSub
        .unsubscribe();

      this.pollingSub =
        undefined;
    }
  }


  /* =========================
     DESTROY
  ========================= */

  ngOnDestroy(): void {
    this.stopPolling();
  }
}