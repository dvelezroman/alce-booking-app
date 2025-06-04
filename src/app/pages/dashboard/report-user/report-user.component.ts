import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportFormComponent } from '../../../components/reports-user/report-user-form/report-user-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ReportUserTableComponent } from '../../../components/reports-user/report-user-table/report-user-table.component';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { ReportsService } from '../../../services/reports.service';
import { StudyContentService } from '../../../services/study-content.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-report-user',
  standalone: true,
  imports: [CommonModule, ReportFormComponent, ReportUserTableComponent, ModalComponent],
  templateUrl: './report-user.component.html',
  styleUrl: './report-user.component.scss'
})
export class ReportUserComponent {
  modal: ModalDto = modalInitializer();
  users: UserDto[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 100;

  lastFiltersUsed: {
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    comment?: boolean;
    alert?: boolean;
    newStudents?: boolean;
  } = {};

  constructor(private reportsService: ReportsService,
              private studyContentService: StudyContentService
  ) {}

  handleFormSubmit(filters: {
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    comment?: boolean;
    alert?: boolean;
    newStudents?: boolean;
  }): void {
    this.lastFiltersUsed = filters;
    this.currentPage = 1;
    this.fetchUsers();
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.fetchUsers();
  }

private fetchUsers(): void {
  const { userId, userRole, userStatus, comment, alert, newStudents } = this.lastFiltersUsed;

  this.reportsService.getUsersData( this.currentPage, this.itemsPerPage, userId, userRole, userStatus, undefined, comment, alert, newStudents ).subscribe({
    next: (response) => {
      this.users = response.users;
      this.totalUsers = response.totalCount;
    },
    error: () => {
      this.modal = {
        ...modalInitializer(),
        show: true,
        isError: true,
        message: 'No se pudo obtener la información del usuario.',
        title: 'Error',
        close: () => this.modal.show = false,
      };
      setTimeout(() => this.modal.show = false, 3000);
    }
  });
}

  totalPages(): number {
    return Math.ceil(this.totalUsers / this.itemsPerPage);
  }

  handleStageClick(studentId: number, currentStageDescription: string): void {
    // this.studyContentService.getStudyContentHistoryForStudentId(studentId).subscribe({
    //   next: (history) => {
    //     if (!history.length) {
    //       this.modal = {
    //         ...modalInitializer(),
    //         show: true,
    //         isContentViewer: true,
    //         isError: false,
    //         title: 'Historial de Stages',
    //         message: 'No hay historial disponible para este estudiante.',
    //         close: () => this.modal.show = false,
    //       };
    //       return;
    //     }

    //     let message = `<div class="stage-history">`;

    //     for (const item of history) {
    //       const date = DateTime.fromISO(item.date);
    //       message += `
    //         <div class="stage-block">
    //           <div>${item.data.stage}</div><br>
    //           Fecha: ${date.toFormat('dd/MM/yyyy')}<br>
    //           Hora: ${item.hour}:00
    //         </div>
    //         <hr>
    //       `;
    //     }

    //     message += `</div>`;

    //     this.modal = {
    //       ...modalInitializer(),
    //       show: true,
    //       isContentViewer: true,
    //       isError: false,
    //       message,
    //       title: 'Historial de Stages',
    //       close: () => this.modal.show = false,
    //     };
    //   }
    // });
  }
}