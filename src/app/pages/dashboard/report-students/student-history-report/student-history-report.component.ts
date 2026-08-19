import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  EMPTY,
  expand,
  Subject,
  Subscription,
  switchMap,
  takeWhile,
  timer
} from 'rxjs';

import { UserDto } from '../../../../services/dtos/user.dto';
import { UsersService } from '../../../../services/users.service';
import { ReportsService } from '../../../../services/reports.service';

import { StudentHistoryHeaderComponent } from '../../../../components/student-history/student-history-header/student-history-header.component';
import { StudentHistoryStudentSelectorComponent } from '../../../../components/student-history/student-history-student-selector/student-history-student-selector.component';
import { StudentHistorySelectedStudentComponent } from '../../../../components/student-history/student-history-selected-student/student-history-selected-student.component';
import { StudentHistoryGenerateReportComponent } from '../../../../components/student-history/student-history-generate-report/student-history-generate-report.component';
import { StudentHistoryReportStatusComponent } from '../../../../components/student-history/student-history-report-status/student-history-report-status.component';
import { StudentHistoryQuickGuideComponent } from '../../../../components/student-history/student-history-quick-guide/student-history-quick-guide.component';
import { StudentHistoryRecentReportsComponent } from '../../../../components/student-history/student-history-recent-reports/student-history-recent-reports.component';
import { StudentHistoryImportantInfoComponent } from '../../../../components/student-history/student-history-important-info/student-history-important-info.component';

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

@Component({
  selector: 'app-student-history-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StudentHistoryHeaderComponent,
    StudentHistoryStudentSelectorComponent,
    StudentHistorySelectedStudentComponent,
    StudentHistoryGenerateReportComponent,
    StudentHistoryReportStatusComponent,
    StudentHistoryQuickGuideComponent,
    StudentHistoryRecentReportsComponent,
    StudentHistoryImportantInfoComponent
  ],
  templateUrl: './student-history-report.component.html',
  styleUrl: './student-history-report.component.scss'
})
export class StudentHistoryReportComponent implements OnDestroy {
  searchTerm = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;
  showDropdown = false;

  private searchInput$ = new Subject<string>();

  loading = false;
  error?: string;
  serverError?: string;

  jobId?: string;
  status?: JobStatus;

  reportReady = false;
  downloadUrl?: string;

  progress = 0;

  private pollingSub?: Subscription;

  constructor(
    private usersService: UsersService,
    private reportsService: ReportsService
  ) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe(term => this.filterUsers(term));
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;

    if (!term.trim()) {
      this.selectedStudent = undefined;
    }

    this.searchInput$.next(term);
  }

  filterUsers(term: string): void {
    if (!term || term.length < 2) {
      this.filteredUsers = [];
      this.showDropdown = false;
      return;
    }

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        term,
        term,
        undefined
      )
      .subscribe({
        next: (result) => {
          this.filteredUsers = result.users ?? [];
          this.showDropdown = true;
        },
        error: () => {
          this.filteredUsers = [];
          this.showDropdown = false;
        }
      });
  }

  selectUser(user: UserDto): void {
    this.selectedStudent = user;
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filteredUsers = [];
    this.showDropdown = false;

    this.resetState();
  }

  hideDropdown(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  generateReport(): void {
    if (!this.selectedStudent?.student?.id) {
      this.error = 'Debes seleccionar un estudiante';
      return;
    }

    this.resetState();

    this.loading = true;
    this.progress = 10;

    const studentId = this.selectedStudent.student.id;

    this.reportsService
      .generateStudentHistoryReport(studentId)
      .subscribe({
        next: (res) => {
          this.jobId = res.jobId;
          this.status = res.status;
          this.startPolling();
        },
        error: () => {
          this.loading = false;
          this.error = 'Error al generar el reporte';
        }
      });
  }

  private startPolling(): void {
    if (!this.jobId) return;

    this.stopPolling();

    this.pollingSub = this.reportsService
      .checkStudentHistoryReportStatus(this.jobId)
      .pipe(
        expand((res: any) => {
          if (
            res.status === 'completed' ||
            res.status === 'failed'
          ) {
            return EMPTY;
          }

          return timer(3000).pipe(
            switchMap(() =>
              this.reportsService
                .checkStudentHistoryReportStatus(this.jobId!)
            )
          );
        }),
        takeWhile(
          (res: any) =>
            res.status !== 'completed' &&
            res.status !== 'failed',
          true
        )
      )
      .subscribe({
        next: (res: any) => {
          this.status = res.status;

          if (
            this.progress < 90 &&
            res.status !== 'completed'
          ) {
            this.progress += 10;
          }

          if (res.status === 'completed') {
            this.progress = 100;
            this.loading = false;
            this.reportReady = true;
            this.downloadUrl = res.s3Url;
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
        }
      });
  }

  private stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  downloadReport(): void {
    if (!this.downloadUrl) return;

    window.open(
      this.downloadUrl,
      '_blank'
    );
  }

  private resetState(): void {
    this.stopPolling();

    this.error = undefined;
    this.serverError = undefined;
    this.jobId = undefined;
    this.status = undefined;
    this.reportReady = false;
    this.downloadUrl = undefined;
    this.progress = 0;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}