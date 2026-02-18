import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
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
export class StudentHistoryReportComponent {

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

  constructor(
    private usersService: UsersService,
    private reportsService: ReportsService
  ) {
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe(term => this.filterUsers(term));
  }

  // ======================
  // SEARCH LOGIC
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
  // GENERATE
  // ======================

  generateReport(): void {
    if (!this.selectedStudent?.student?.id) {
      this.error = 'Debes seleccionar un estudiante';
      return;
    }

    this.resetState();
    this.loading = true;

    const studentId = this.selectedStudent.student.id;

    this.reportsService.generateStudentHistoryReport(studentId).subscribe({
      next: (res) => {
        this.jobId = res.jobId;
        this.status = res.status;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Error al generar el reporte';
      }
    });
  }

  // ======================
  // DOWNLOAD
  // ======================

  downloadReport(): void {
    if (!this.jobId) return;

    this.loading = true;
    this.error = undefined;
    this.serverError = undefined;

    this.reportsService
      .checkStudentHistoryReportStatus(this.jobId)
      .subscribe({
        next: (res: any) => {
          this.status = res.status;

          if (res.status === 'completed') {
            this.loading = false;
            window.open(res.s3Url, '_blank');
            return;
          }

          if (res.status === 'failed') {
            this.loading = false;
            this.serverError = res.errorMessage;
            this.error = 'reporte fallido.';
            return;
          }

          // queued o processing
          this.loading = false;
          this.error = 'El reporte aún no está listo. Intenta nuevamente.';
        },
        error: () => {
          this.loading = false;
          this.error = 'Error consultando el estado del reporte';
        }
      });
  }

  // ======================
  // RESET
  // ======================

  private resetState(): void {
    this.error = undefined;
    this.serverError = undefined;
    this.jobId = undefined;
    this.status = undefined;
  }
}