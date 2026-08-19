import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReportsService } from '../../../services/reports.service';
import {
  UsersExcelFilterDto,
  AbsentStudentsExcelFilterDto,
} from '../../../services/dtos/reports.dto';

import { InstructorsService } from '../../../services/instructors.service';
import { StagesService } from '../../../services/stages.service';
import { Stage } from '../../../services/dtos/student.dto';

/* =========================
   CHILD COMPONENTS
========================= */

import { ReportExcelHeaderComponent } from '../../../components/report-user-excel/report-excel-header/report-excel-header.component';
import { ReportExcelTypeSelectorComponent } from '../../../components/report-user-excel/report-excel-type-selector/report-excel-type-selector.component';
import { ReportExcelSelectedReportComponent } from '../../../components/report-user-excel/report-excel-selected-report/report-excel-selected-report.component';
import { ReportExcelFiltersComponent } from '../../../components/report-user-excel/report-excel-filters/report-excel-filters.component';
import { ReportExcelSummaryComponent } from '../../../components/report-user-excel/report-excel-summary/report-excel-summary.component';
import { ReportExcelHistoryComponent } from '../../../components/report-user-excel/report-excel-history/report-excel-history.component';
import { ReportExcelInfoComponent } from '../../../components/report-user-excel/report-excel-info/report-excel-info.component';

export type ReportExcelMode =
  | 'users'
  | 'absents'
  | 'without-meetings';

@Component({
  selector: 'app-reports-excel-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ReportExcelHeaderComponent,
    ReportExcelTypeSelectorComponent,
    ReportExcelSelectedReportComponent,
    ReportExcelFiltersComponent,
    ReportExcelSummaryComponent,
    ReportExcelHistoryComponent,
    ReportExcelInfoComponent,
  ],
  templateUrl: './reports-excel-page.component.html',
  styleUrl: './reports-excel-page.component.scss',
})
export class ReportsExcelPageComponent implements OnInit {

  /* =========================
     STATE
  ========================= */

  loading = false;

  stages: Stage[] = [];

  currentMode: ReportExcelMode =
    'users';

  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private reportsService: ReportsService,
    private stagesService: StagesService,
    private instructorsService: InstructorsService,
  ) {}

  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.fetchStages();
  }

  /* =========================
     REPORT MODE
  ========================= */

  toggleMode(): void {
    this.currentMode =
      this.currentMode === 'users'
        ? 'absents'
        : 'users';
  }

  onReportTypeSelected(
    mode: ReportExcelMode,
  ): void {
    this.currentMode = mode;
  }

  /* =========================
     STAGES
  ========================= */

  private fetchStages(): void {
    this.stagesService
      .getAll()
      .subscribe({
        next: (data) => {
          this.stages =
            data.filter(stage => {
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

        error: (err) => {
          console.error(
            'Error al obtener stages:',
            err,
          );

          this.stages = [];
        },
      });
  }

  /* =========================
     FILTER SUBMIT
  ========================= */

  handleUsersFilters(
    filters: UsersExcelFilterDto,
  ): void {
    this.handleDownloadUsersExcel(
      filters,
    );
  }

  handleAbsentFilters(
    filters: AbsentStudentsExcelFilterDto,
  ): void {
    this.handleDownloadAbsentExcel(
      filters,
    );
  }

  handleWithoutMeetingsFilters(
    filters: AbsentStudentsExcelFilterDto,
  ): void {
    this.handleDownloadStudentsWithoutMeetingsExcel(
      filters,
    );
  }

  /* =========================
     USERS EXCEL
  ========================= */

  handleDownloadUsersExcel(
    filters: UsersExcelFilterDto,
  ): void {
    this.loading = true;

    this.reportsService
      .downloadUsersExcel(filters)
      .subscribe({
        next: (blob) => {
          this.downloadFile(
            blob,
            'reporte_usuarios.xlsx',
          );

          this.loading = false;
        },

        error: (err) => {
          console.error(
            'Error al descargar Excel de usuarios:',
            err,
          );

          this.loading = false;
        },
      });
  }

  /* =========================
     ABSENT STUDENTS
  ========================= */

  handleDownloadAbsentExcel(
    filters: AbsentStudentsExcelFilterDto,
  ): void {
    this.loading = true;

    this.reportsService
      .downloadAbsentStudentsExcel(
        filters,
      )
      .subscribe({
        next: (blob) => {
          this.downloadFile(
            blob,
            'estudiantes_ausentes.xlsx',
          );

          this.loading = false;
        },

        error: (err) => {
          console.error(
            'Error al descargar Excel de ausentes:',
            err,
          );

          this.loading = false;
        },
      });
  }

  /* =========================
     WITHOUT MEETINGS
  ========================= */

  handleDownloadStudentsWithoutMeetingsExcel(
    filters: AbsentStudentsExcelFilterDto,
  ): void {
    this.loading = true;

    this.reportsService
      .downloadStudentsWithoutMeetingsExcel(
        filters,
      )
      .subscribe({
        next: (blob) => {
          this.downloadFile(
            blob,
            'estudiantes_sin_reuniones.xlsx',
          );

          this.loading = false;
        },

        error: (err) => {
          console.error(
            'Error al descargar Excel de estudiantes sin reuniones:',
            err,
          );

          this.loading = false;
        },
      });
  }

  /* =========================
     DOWNLOAD HELPER
  ========================= */

  private downloadFile(
    blob: Blob,
    filename: string,
  ): void {
    const url =
      window.URL.createObjectURL(
        blob,
      );

    const a =
      document.createElement('a');

    a.href = url;
    a.download = filename;

    a.click();

    window.URL.revokeObjectURL(
      url,
    );
  }
}