import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDto, UserStatus } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-report-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-user-table.component.html',
  styleUrls: ['./report-user-table.component.scss']
})
export class ReportUserTableComponent {
  @Input() users: UserDto[] = [];
  @Input() totalUsers: number = 0;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 100;
  @Input() totalPages: number = 100;
  @Output() pageChanged = new EventEmitter<number>();
  @Output() stageClicked = new EventEmitter<{ studentId: number }>();

  getUserFullName(user: UserDto): string {
    return `${user.lastName || ''} ${user.firstName || ''}`.trim();
  }

  getUserStatusLabel(status?: UserStatus): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'Activo';
      case UserStatus.INACTIVE:
        return 'Inactivo';
      case UserStatus.HOLD:
        return 'En pausa';
      default:
        return 'Desconocido';
    }
  }

  getAlertLabel(user: UserDto): string {
    return user.meetingsAlert ? 'Con alerta' : 'Sin alerta';
  }

  getStageLabel(user: UserDto): string {
    return user.student?.stage?.description || 'No asignado';
  }

  handleStageClick(user: UserDto): void {
    const stageDescription = this.getStageLabel(user);
    const studentId = user.student?.id;
    if (studentId) {
      this.stageClicked.emit({ studentId });
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.emit(page);
    }
  }

  visiblePages(): number[] {
    const total = this.totalPages;
    const range = [];

    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(total, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }
}
