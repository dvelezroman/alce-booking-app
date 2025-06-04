import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportFormComponent } from '../../../components/reports-user/report-user-form/report-user-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ReportUserTableComponent } from '../../../components/reports-user/report-user-table/report-user-table.component';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { ReportsService } from '../../../services/reports.service';

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

  constructor(private reportsService: ReportsService) {}

  handleFormSubmit(filters: {
    userId: number;
    userRole: UserRole;
    userStatus?: UserStatus;
    comment?: boolean;
    alert?: boolean;
    stageId?: number;
    newStudents?: boolean;
  }): void {
    this.reportsService.getUsersData(
      1,
      100,
      filters.userId,
      filters.userRole,
      filters.userStatus,
      filters.stageId,
      filters.comment,
      filters.alert,
      filters.newStudents
    ).subscribe({
      next: (users) => {
        this.users = users;
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

        setTimeout(() => {
          this.modal.show = false;
        }, 3000);
      }
    });
  }

  handleStageClick(studentId: number, currentStageDescription: string): void {
    // implementación futura para historial de stages
  }
}