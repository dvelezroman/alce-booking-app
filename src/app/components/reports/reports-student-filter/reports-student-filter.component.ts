import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { ReportsService } from '../../../services/reports.service';
import { StagesService } from '../../../services/stages.service';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-reports-student-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-student-filter.component.html',
  styleUrl: './reports-student-filter.component.scss'
})
export class ReportsStudentFilterComponent implements OnInit {
  @Input() isReportGenerated: boolean = false;
  @Output() filtersSubmitted = new EventEmitter<{ studentId: number; from?: string; to?: string; stageId?: number }>();
  @Output() downloadRequested = new EventEmitter<void>();

  stages: Stage[] = [];
  selectedStageId?: string; 
  searchTerm: string = '';
  filteredUsers: UserDto[] = [];
  searchInput$ = new Subject<string>();
  selectedStudent?: UserDto;
  fromDate?: string;
  toDate?: string;
  
  showUserDropdown: boolean = false;
  showStudentRequiredError: boolean = false;
  showFromDateError = false;
  showToDateError = false;

  constructor(private usersService: UsersService,
               private reportsService: ReportsService,
                private stagesService: StagesService,
  ) {
    this.searchInput$.pipe(debounceTime(300)).subscribe((term: string) => {
      this.filterUsers(term);
    });
  }

  ngOnInit() {
    this.stagesService.getAll().subscribe((stages: Stage[]) => {
      this.stages = stages;
    });
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }

  filterUsers(term: string): void {
    if (!term || term.trim().length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.usersService.searchUsers(undefined, undefined, undefined, term, term, undefined).subscribe({
      next: (result) => {
        this.filteredUsers = result.users;
        this.showUserDropdown = true;
      },
      error: () => {
        this.filteredUsers = [];
        this.showUserDropdown = false;
      }
    });
  }

  selectUser(user: UserDto): void {
    this.selectedStudent = user;
    this.searchTerm = `${user.firstName} ${user.lastName}`;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    this.showStudentRequiredError = false;
  }

  hideDropdown(): void {
    setTimeout(() => (this.showUserDropdown = false), 200);
  }

  onFromDateChange(): void {
    if (this.fromDate) {
      this.showFromDateError = false;
    }
  }

  onToDateChange(): void {
    if (this.toDate) {
      this.showToDateError = false;
    }
  }

  searchStudentDetail(): void {
  this.showStudentRequiredError = !this.selectedStudent;
  this.showFromDateError = !this.fromDate;
  this.showToDateError = !this.toDate;

  if (this.showStudentRequiredError || this.showFromDateError || this.showToDateError) {
    return;
  }

  const studentId = this.selectedStudent?.student?.id ?? 0;
  const stageId = this.selectedStageId ? Number(this.selectedStageId) : undefined;

  this.filtersSubmitted.emit({
    studentId: studentId,
    from: this.fromDate,
    to: this.toDate,
    stageId: stageId
  });
}

  onDownloadClicked(): void {
    this.downloadRequested.emit();
  }

  summaryReport() {
    this.showFromDateError = !this.fromDate;
    this.showToDateError = !this.toDate;
    
    if (!this.fromDate || !this.toDate) {
      return;
    }

    const stageId = this.selectedStageId ? Number(this.selectedStageId) : undefined;

    this.reportsService.getCsvSummaryReport(
      this.fromDate,
      this.toDate,
      stageId
    ).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `Resumen-General-Clases-Agendadas-desde-${this.fromDate}-hasta-${this.toDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        console.error("Error al descargar el resumen general:", error);
      },
    });
  }

  dailySummaryReport() {
    if (!this.fromDate || !this.toDate) {
      this.showFromDateError = !this.fromDate;
      this.showToDateError = !this.toDate;
      return;
    }

    const studentId = this.selectedStudent?.student?.id ?? 0;
    const stageId = this.selectedStageId ? Number(this.selectedStageId) : undefined;

    this.reportsService.getCsvDailySummaryReport(
      this.fromDate,
      this.toDate,
      studentId,
      stageId,
    ).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `Resumen-General-Diario-Clases-Agendadas-desde-${this.fromDate}-hasta-${this.toDate}.csv`;
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (error) => {
        console.error("Error al descargar el resumen diario:", error);
      },
    });
  }
}