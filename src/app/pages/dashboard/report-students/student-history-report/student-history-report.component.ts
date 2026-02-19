import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, interval, Subscription, switchMap, takeWhile, expand, EMPTY, timer } from 'rxjs';
import { UserDto } from '../../../../services/dtos/user.dto';
import { UsersService } from '../../../../services/users.service';
import { ReportsService } from '../../../../services/reports.service';

type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

@Component({
  selector: 'app-student-history-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-history-report.component.html',
  styleUrl: './student-history-report.component.scss'
})
export class StudentHistoryReportComponent implements OnDestroy {

  // ======================
  // SEARCH
  // ======================

  searchTerm = '';
  filteredUsers: UserDto[] = [];
  selectedStudent?: UserDto;
  showDropdown = false;

  private searchInput$ = new Subject<string>();

  // ======================
  // JOB STATE
  // ======================

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

  // ======================
  // SEARCH
  // ======================

  onSearchChange(term: string): void {
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
      .searchUsers(undefined, undefined, undefined, term, term, undefined)
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

  // ======================
  // GENERATE REPORT
  // ======================

  generateReport(): void {
    if (!this.selectedStudent?.student?.id) {
      this.error = 'Debes seleccionar un estudiante';
      return;
    }

    this.resetState();

    this.loading = true;
    this.progress = 10;

    const studentId = this.selectedStudent.student.id;

    this.reportsService.generateStudentHistoryReport(studentId).subscribe({
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

  // ======================
  // POLLING AUTOMÁTICO
  // ======================

  private startPolling(): void {
    if (!this.jobId) return;

    this.stopPolling();

    this.pollingSub = this.reportsService
      .checkStudentHistoryReportStatus(this.jobId)
      .pipe(
        expand((res: any) => {

          // Si terminó o falló, no seguimos expandiendo
          if (res.status === 'completed' || res.status === 'failed') {
            return EMPTY;
          }

          // Esperamos 3 segundos después de recibir respuesta
          return timer(3000).pipe(
            switchMap(() =>
              this.reportsService.checkStudentHistoryReportStatus(this.jobId!)
            )
          );
        }),

        // hasta que completed o failed
        takeWhile(
          (res: any) =>
            res.status !== 'completed' && res.status !== 'failed',
          true // importante: incluye la última emisión
        )
      )
      .subscribe({
        next: (res: any) => {

          this.status = res.status;

          // progreso falso
          if (this.progress < 90 && res.status !== 'completed') {
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

  // ======================
  // DOWNLOAD (SOLO CLICK)
  // ======================

  downloadReport(): void {
    if (!this.downloadUrl) return;
    window.open(this.downloadUrl, '_blank');
  }

  // ======================
  // RESET
  // ======================

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

  // matar polling si se sale de la página
  ngOnDestroy(): void {
    this.stopPolling();
  }
}