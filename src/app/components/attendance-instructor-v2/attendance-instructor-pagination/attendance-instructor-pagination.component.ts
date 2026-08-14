import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-attendance-instructor-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-instructor-pagination.component.html',
  styleUrl: './attendance-instructor-pagination.component.scss',
})
export class AttendanceInstructorPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() currentPage = 1;

  @Input() itemsPerPage = 10;

  @Input() totalItems = 0;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() pageChange =
    new EventEmitter<number>();


  /* =========================
     PAGINATION
  ========================= */

  get totalPages(): number {
    return Math.ceil(
      this.totalItems / this.itemsPerPage,
    );
  }

  get pages(): number[] {
    const totalPages = this.totalPages;

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      );
    }

    let startPage = Math.max(
      1,
      this.currentPage - 2,
    );

    let endPage = Math.min(
      totalPages,
      startPage + 4,
    );

    if (endPage - startPage < 4) {
      startPage = Math.max(
        1,
        endPage - 4,
      );
    }

    return Array.from(
      {
        length: endPage - startPage + 1,
      },
      (_, index) =>
        startPage + index,
    );
  }


  /* =========================
     RESULTS
  ========================= */

  get resultsStart(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.itemsPerPage
    ) + 1;
  }

  get resultsEnd(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return Math.min(
      this.currentPage *
      this.itemsPerPage,
      this.totalItems,
    );
  }


  /* =========================
     NAVIGATION
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
    this.goToPage(
      this.currentPage - 1,
    );
  }

  nextPage(): void {
    this.goToPage(
      this.currentPage + 1,
    );
  }


  /* =========================
     STATES
  ========================= */

  get isFirstPage(): boolean {
    return this.currentPage <= 1;
  }

  get isLastPage(): boolean {
    return (
      this.currentPage >=
      this.totalPages
    );
  }
}