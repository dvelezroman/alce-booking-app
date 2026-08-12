import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-instructor-scheduling-request-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-scheduling-request-pagination.component.html',
  styleUrl: './instructor-scheduling-request-pagination.component.scss',
})
export class InstructorSchedulingRequestPaginationComponent {
  @Input() pageIndex: number = 0;
  @Input() totalPages: number = 1;
  @Input() canPrev: boolean = false;
  @Input() canNext: boolean = false;

  @Output() firstPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() lastPage = new EventEmitter<void>();

  onFirstPage(): void {
    if (!this.canPrev) return;
    this.firstPage.emit();
  }

  onPreviousPage(): void {
    if (!this.canPrev) return;
    this.previousPage.emit();
  }

  onNextPage(): void {
    if (!this.canNext) return;
    this.nextPage.emit();
  }

  onLastPage(): void {
    if (!this.canNext) return;
    this.lastPage.emit();
  }

  onPageSelected(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.pageIndex) {
      return;
    }

    if (page < this.pageIndex) {
      const steps = this.pageIndex - page;

      for (let i = 0; i < steps; i++) {
        this.previousPage.emit();
      }

      return;
    }

    const steps = page - this.pageIndex;

    for (let i = 0; i < steps; i++) {
      this.nextPage.emit();
    }
  }

  get visiblePages(): number[] {
    if (this.totalPages <= 5) {
      return Array.from(
        { length: this.totalPages },
        (_, index) => index,
      );
    }

    const start = Math.max(
      0,
      Math.min(
        this.pageIndex - 2,
        this.totalPages - 5,
      ),
    );

    return Array.from(
      { length: 5 },
      (_, index) => start + index,
    );
  }

  isCurrentPage(page: number): boolean {
    return page === this.pageIndex;
  }

  trackByPage(
    index: number,
    page: number,
  ): number {
    return page;
  }
}