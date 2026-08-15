import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-lead-scheduling-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './admin-lead-scheduling-pagination.component.html',
  styleUrl: './admin-lead-scheduling-pagination.component.scss',
})
export class AdminLeadSchedulingPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 25;
  @Input() pageSizeOptions: readonly number[] = [];
  @Input() rangeLabel = '0 resultados';
  @Input() canPrevPage = false;
  @Input() canNextPage = false;

  /* =========================
     OUTPUTS
  ========================= */

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() previousRequested = new EventEmitter<void>();
  @Output() nextRequested = new EventEmitter<void>();

  /* =========================
     PAGES
  ========================= */

  get visiblePages(): Array<number | 'ellipsis'> {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        'ellipsis',
        total,
      ];
    }

    if (current >= total - 3) {
      return [
        1,
        'ellipsis',
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      'ellipsis',
      current - 1,
      current,
      current + 1,
      'ellipsis',
      total,
    ];
  }

  /* =========================
     ACTIONS
  ========================= */

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.pageChange.emit(page);
  }

  previousPage(): void {
    if (!this.canPrevPage) {
      return;
    }

    this.previousRequested.emit();
  }

  nextPage(): void {
    if (!this.canNextPage) {
      return;
    }

    this.nextRequested.emit();
  }

  onPageSizeChange(value: number | string): void {
    const pageSize = Number(value);

    if (
      !Number.isFinite(pageSize) ||
      pageSize <= 0
    ) {
      return;
    }

    this.pageSizeChange.emit(pageSize);
  }
}