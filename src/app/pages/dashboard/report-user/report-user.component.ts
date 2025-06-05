import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ReportFormComponent } from '../../../components/reports-user/report-user-form/report-user-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { ReportUserTableComponent } from '../../../components/reports-user/report-user-table/report-user-table.component';
import { UserDto, UserRole, UserStatus } from '../../../services/dtos/user.dto';
import { ReportsService } from '../../../services/reports.service';
import { Stage, StudentStageHistory } from '../../../services/dtos/student.dto';
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

    const history = selectedUser.student.StudentAndStagesHistory;

    if (!history || history.length === 0) {
      const message = this.generateCurrentStageHtml( selectedUser.student.stage, selectedUser.student.createdAt );

      this.showModal(message, {
        title: 'Historial de Stages',
        isContentViewer: true,
      });
      return;
    }

    const sortedHistory = this.getSortedStageHistory(history);
    const message = this.generateStageHistoryHtml(sortedHistory);

    this.showModal(message, {
      title: 'Historial de Stages',
      isContentViewer: true,
    });
  }

  private generateCurrentStageHtml(stage: Stage, fromDate: string | Date): string {
    const stageNumber = stage.number;
    const stageDescription = stage.description;
    const from = new Date(fromDate).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `
      <div class="stage-info-block">
        <div>${stageDescription}</div>
        <div>Desde: ${from}</div>
      </div>
    `;
  }

  private getSortedStageHistory(history: StudentStageHistory[]): StudentStageHistory[] {
    return [...history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  private generateStageHistoryHtml(history: StudentStageHistory[]): string {
    let html = `<div class="stage-info-block">`;

    for (let i = 0; i < history.length; i++) {
      const current = history[i];
      const next = history[i + 1];

      const stageNumber = current.stage?.number || `STG ${current.stageId}`;
      const stageDescription = current.stage?.description || '';

      const fromDate = DateTime.fromISO(current.createdAt);
      const toDate = next ? DateTime.fromISO(next.createdAt) : null;

      const from = fromDate.toFormat('dd/MM/yyyy');
      const to = toDate ? toDate.toFormat('dd/MM/yyyy') : null;
      const daysBetween = toDate ? toDate.diff(fromDate, 'days').days : null;

      html += `
        <div class="stage-item">
          <div>${stageDescription}</div>
          <div>Desde: ${from}${to ? ` - Hasta: ${to}` : ''}</div>
          ${daysBetween ? `<div>Días transcurridos: ${Math.round(daysBetween)} días</div>` : ''}
          <br />
        </div>
      `;
    }

    html += `</div>`;
    return html;
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
