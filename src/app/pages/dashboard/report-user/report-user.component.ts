import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportFormComponent } from '../../../components/reports-user/report-user-form/report-user-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ReportUserTableComponent } from '../../../components/reports-user/report-user-table/report-user-table.component';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { ReportsService } from '../../../services/reports.service';
import { StudyContentService } from '../../../services/study-content.service';

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
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 100;

  lastFiltersUsed: {
    userId?: number;
    userRole?: UserRole;
    userStatus?: UserStatus;
    stageId?: number;
    comment?: boolean;
    alert?: boolean;
    newStudents?: boolean;
  } = {};

  constructor(private reportsService: ReportsService,
              private studyContentService: StudyContentService
  ) {}

  handleFormSubmit(filters: { userId?: number; userRole?: UserRole; userStatus?: UserStatus; comment?: boolean; 
                              stageid?: number; alert?: boolean; newStudents?: boolean }): void {
    this.lastFiltersUsed = filters;
    this.currentPage = 1;
    this.fetchUsers();
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.fetchUsers();
  }

  private fetchUsers(): void {
    const { userId, userRole, userStatus, comment, alert, newStudents, stageId } = this.lastFiltersUsed;

    this.reportsService.getUsersData( this.currentPage, userId, userRole, userStatus, stageId, comment, alert, newStudents )
    .subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.totalCount;
        this.totalPages = Math.ceil(this.totalUsers / this.itemsPerPage);
      },
      error: () => {
        this.showModal('No se pudo obtener la información del usuario.', {
          title: 'Error',
          isError: true
        });
      }
    });
  }

  handleStageClick(studentId: number): void {
    const selectedUser = this.users.find(u => u.student?.id === studentId);

    if (!selectedUser?.student?.stage || !selectedUser.student.createdAt) {
      this.showModal('No hay información de stage disponible.', {
        title: 'Historial de Stages',
        isContentViewer: true,
      });
      return;
    }

    const { number, description } = selectedUser.student.stage;
    const createdAt = new Date(selectedUser.student.createdAt).toLocaleDateString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const message = `
      <div class="stage-info-block">
        <div>Stage actual:  ${description}</div>
        <div>Inicio del stage: ${createdAt}</div>
        
      </div>
    `;

    this.showModal(message, {
      title: 'Historial de Stages',
      isContentViewer: true,
    });
  }
  
  private showModal(message: string, options?: {
    title?: string;
    isError?: boolean;
    isSuccess?: boolean;
    isInfo?: boolean;
    isContentViewer?: boolean;
  }): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      title: options?.title || '',
      isError: options?.isError ?? false,
      isSuccess: options?.isSuccess ?? false,
      isInfo: options?.isInfo ?? false,
      isContentViewer: options?.isContentViewer ?? false,
      close: () => this.closeModal(),
    };

      if (!options?.isContentViewer) {
    setTimeout(() => this.closeModal(), 3000);
  }
  }

  private closeModal(): void {
    this.modal = { ...modalInitializer() };
  }
}
