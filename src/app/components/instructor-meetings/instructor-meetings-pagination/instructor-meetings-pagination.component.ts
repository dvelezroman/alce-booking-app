import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-instructor-meetings-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-meetings-pagination.component.html',
  styleUrl: './instructor-meetings-pagination.component.scss',
})
export class InstructorMeetingsPaginationComponent {
  @Input() currentPage: number = 1;

  @Input() totalPages: number = 1;

  @Input() totalItems: number = 0;

  @Input() startItem: number = 0;

  @Input() endItem: number = 0;

  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    if (this.totalPages <= 1) {
      return [1];
    }

    const visiblePages = 5;
    const half = Math.floor(visiblePages / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + visiblePages - 1);

    if (end - start + 1 < visiblePages) {
      start = Math.max(1, end - visiblePages + 1);
    }

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index,
    );
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get showStartEllipsis(): boolean {
    return this.pages.length > 0 && this.pages[0] > 2;
  }

  get showEndEllipsis(): boolean {
    return this.pages.length > 0 && this.pages[this.pages.length - 1] < this.totalPages - 1;
  }

  get showFirstPage(): boolean {
    return this.pages.length > 0 && this.pages[0] > 1;
  }

  get showLastPage(): boolean {
    return this.pages.length > 0 && this.pages[this.pages.length - 1] < this.totalPages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.pageChange.emit(page);
  }

  goToPrevious(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.pageChange.emit(this.currentPage - 1);
  }

  goToNext(): void {
    if (!this.canGoNext) {
      return;
    }

    this.pageChange.emit(this.currentPage + 1);
  }

  isActivePage(page: number): boolean {
    return page === this.currentPage;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }
}