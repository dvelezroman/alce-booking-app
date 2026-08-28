import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MeetingReportDetailed } from '../../../services/dtos/meeting-theme.dto';

@Component({
  selector: 'app-report-student-detailed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-student-detailed.component.html',
  styleUrl: './report-student-detailed.component.scss'
})
export class ReportStudentDetailedComponent {
  @Input() reportData: MeetingReportDetailed[] = [];
  @Input() isReportGenerated = false;

  page = 1;
  limit = 6;

  get total(): number {
    return this.reportData.length;
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

  get paginatedData(): MeetingReportDetailed[] {
    const start = (this.page - 1) * this.limit;
    return this.reportData.slice(start, start + this.limit);
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
}