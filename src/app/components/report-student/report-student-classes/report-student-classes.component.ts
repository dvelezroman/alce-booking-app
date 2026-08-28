import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MeetingDataI } from '../../../services/dtos/meeting-theme.dto';

@Component({
  selector: 'app-report-student-classes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-student-classes.component.html',
  styleUrl: './report-student-classes.component.scss'
})
export class ReportStudentClassesComponent {
  @Input() meetingsData: MeetingDataI[] = [];

  page = 1;
  limit = 6;

  get total(): number {
    return this.meetingsData.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  get paginatedMeetings(): MeetingDataI[] {
    const start = (this.page - 1) * this.limit;
    return this.meetingsData.slice(start, start + this.limit);
  }

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return this.page < this.totalPages;
  }

  get visiblePages(): number[] {
    const total = this.totalPages;

    if (total <= 3) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    if (this.page <= 2) {
      return [1, 2, 3];
    }

    if (this.page >= total - 1) {
      return [
        total - 2,
        total - 1,
        total
      ];
    }

    return [
      this.page - 1,
      this.page,
      this.page + 1
    ];
  }

  previousPage(): void {
    if (!this.canPrev) return;
    this.page--;
  }

  nextPage(): void {
    if (!this.canNext) return;
    this.page++;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PRESENT':
        return 'status--success';

      case 'CANCELLED':
        return 'status--danger';

      case 'PENDING':
        return 'status--warning';

      default:
        return 'status--neutral';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Activa';

      case 'COMPLETED':
        return 'Completada';

      case 'CANCELLED':
        return 'Cancelada';

      case 'PENDING':
        return 'Pendiente';

      case 'PRESENT':
        return 'Presente';

      default:
        return status || 'Sin estado';
    }
  }

  formatDate(value?: string): string {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  formatTime(value?: string): string {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }
}