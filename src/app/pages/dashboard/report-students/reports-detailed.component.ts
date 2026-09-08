import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ReportStudentClassesComponent } from '../../../components/report-student/report-student-classes/report-student-classes.component';
import { ReportStudentDetailedComponent } from '../../../components/report-student/report-student-detailed/report-student-detailed.component';
import { ReportStudentFilterComponent } from '../../../components/report-student/report-student-filter/report-student-filter.component';
import { ReportStudentHeaderComponent } from '../../../components/report-student/report-student-header/report-student-header.component';
import { ReportStudentStatisticsComponent } from '../../../components/report-student/report-student-statistics/report-student-statistics.component';
import { ReportStudentSummaryComponent } from '../../../components/report-student/report-student-summary/report-student-summary.component';
import { ReportStudentTypeSelectorComponent } from '../../../components/report-student/report-student-type-selector/report-student-type-selector.component';
import { MeetingDataI, MeetingReportDetailed, StatisticalDataI } from '../../../services/dtos/meeting-theme.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { ReportsService } from '../../../services/reports.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-reports-detailed',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ReportStudentHeaderComponent,
    ReportStudentFilterComponent,
    ReportStudentTypeSelectorComponent,
    ReportStudentDetailedComponent,
    ReportStudentStatisticsComponent,
    ReportStudentClassesComponent,
    ReportStudentSummaryComponent
  ],
  templateUrl: './reports-detailed.component.html',
  styleUrl: './reports-detailed.component.scss'
})
export class ReportsDetailedComponent {
  selectedStudentId?: number;
  selectedStudent: UserDto | null = null;
  filteredStudents: UserDto[] = [];
  studentSearchInput$ = new Subject<string>();
  showStudentDropdown = false;
  isStudentFieldInvalid = false;

  reportData: MeetingReportDetailed[] = [];
  statisticalData: StatisticalDataI | null = null;
  meetingsData: MeetingDataI[] = [];
  searchAttempted = false;
  showReportButtons = false;
  activeReport: 'detailed' | 'statistical' | 'meetings' = 'detailed';
  isReportGenerated = false;
  modalData: ModalDto = modalInitializer();

  lastFilters?: {
    studentId: number;
    from?: string;
    to?: string;
    stageId?: number;
  };

  downloadFilters: { from?: string; to?: string; stageId?: number } = {};

  constructor(
    private reportsService: ReportsService,
    private usersService: UsersService
  ) {
    this.studentSearchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.fetchFilteredStudents(term);
      });
  }

  onDownloadFiltersChanged(filters: {
    from?: string;
    to?: string;
    stageId?: number;
  }): void {
    this.downloadFilters = filters;
  }

  get canDownloadReport(): boolean {
    return !!this.downloadFilters.from && !!this.downloadFilters.to;
  }

  onStudentSearchChange(term: string): void {
    this.selectedStudent = null;
    this.selectedStudentId = undefined;
    this.isStudentFieldInvalid = false;

    this.studentSearchInput$.next(term);
  }

  fetchFilteredStudents(term: string): void {
    const query = term.trim().toLowerCase();

    if (query.length < 2) {
      this.filteredStudents = [];
      this.showStudentDropdown = false;
      return;
    }

    this.usersService.searchUsers(
      0,
      20,
      undefined,
      query,
      query,
      undefined,
      UserRole.STUDENT
    ).subscribe({
      next: (res) => {
        this.filteredStudents = res.users;
        this.showStudentDropdown = this.filteredStudents.length > 0;
      },
      error: () => {
        this.filteredStudents = [];
        this.showStudentDropdown = false;
      }
    });
  }

  onStudentSelected(user: UserDto): void {
    this.selectedStudent = user;
    this.selectedStudentId = user.student?.id;

    this.filteredStudents = [];
    this.showStudentDropdown = false;
    this.isStudentFieldInvalid = false;
  }

  hideStudentDropdown(): void {
    setTimeout(() => {
      this.showStudentDropdown = false;
    }, 200);
  }

  onFiltersSubmitted(filters: {
    studentId: number;
    from?: string;
    to?: string;
    stageId?: number;
  }) {
    const studentId = this.selectedStudentId ?? filters.studentId;

    if (!studentId) {
      this.isStudentFieldInvalid = true;
      return;
    }

    this.selectedStudentId = studentId;
    this.lastFilters = {
      ...filters,
      studentId
    };

    this.searchAttempted = true;
    this.showReportButtons = true;
    this.isReportGenerated = true;
    this.activeReport = 'detailed';

    this.reportsService.getDetailedStatistics(
      studentId,
      filters.from!,
      filters.to!,
      filters.stageId
    ).subscribe({
      next: (data) => {
        this.reportData = data || [];
        this.isReportGenerated = this.reportData.length > 0;
      },
      error: () => {
        this.reportData = [];
        this.isReportGenerated = false;
      }
    });
  }

  fetchDetailedReport() {
    if (!this.lastFilters) return;

    this.activeReport = 'detailed';

    this.reportsService.getDetailedStatistics(
      this.lastFilters.studentId,
      this.lastFilters.from!,
      this.lastFilters.to!
    ).subscribe({
      next: (data) => {
        this.reportData = data || [];
      },
      error: () => {
        this.reportData = [];
      }
    });
  }

  fetchStatisticalReport() {
    if (!this.lastFilters) return;

    this.activeReport = 'statistical';

    this.reportsService.getStatisticsByStudentId(
      this.lastFilters.studentId,
      this.lastFilters.from!,
      this.lastFilters.to!
    ).subscribe({
      next: (data) => {
        //console.log('STATISTICAL DATA:', data);
        this.statisticalData = data;
      },
      error: (error) => {
        console.error('ERROR STATISTICAL REPORT:', error);
        this.statisticalData = null;
      }
    });
  }

  fetchMeetingsReport() {
    if (!this.lastFilters) return;

    this.activeReport = 'meetings';

    this.reportsService.getMeetingsByStudentId(
      this.lastFilters.studentId,
      this.lastFilters.from!,
      this.lastFilters.to!
    ).subscribe({
      next: (data) => {
        this.meetingsData = data || [];
      },
      error: () => {
        this.meetingsData = [];
      }
    });
  }

  openDownloadModal() {
    const { from, to } = this.downloadFilters;

    if (!from || !to) return;

    this.modalData = {
      show: true,
      message: '¿Desea descargar el documento?',
      isError: false,
      isInfo: false,
      isSuccess: false,
      close: () => this.closeModal(),
      confirm: () => this.confirmDownload()
    };
  }

  closeModal() {
    this.modalData.show = false;
  }

  confirmDownload() {
    const { from, to, stageId } = this.downloadFilters;

    if (!from || !to) return;

    const studentId = this.selectedStudentId;

    if (studentId) {
      const reportType = {
        type: 'GET_DETAIL_REPORT',
        label: `Reporte_detallado_estudianteId_${studentId}`
      };

      this.reportsService.getCsvReport(
        reportType.type,
        studentId,
        from,
        to,
        stageId
      ).subscribe({
        next: (blob) => {
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(blob);

          a.href = url;
          a.download = `${reportType.label}_${from}_${to}.csv`;

          document.body.appendChild(a);
          a.click();
          a.remove();

          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('ERROR DOWNLOADING STUDENT REPORT:', error);
        }
      });

    } else {
      this.reportsService.getCsvSummaryReport(
        from,
        to,
        stageId
      ).subscribe({
        next: (blob) => {
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(blob);

          a.href = url;
          a.download = `Reporte_general_estudiantes_${from}_${to}.xlsx`;

          document.body.appendChild(a);
          a.click();
          a.remove();

          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('ERROR DOWNLOADING GENERAL REPORT:', error);
        }
      });
    }

    this.closeModal();
  }
}