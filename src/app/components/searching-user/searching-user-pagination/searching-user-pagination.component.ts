import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-searching-user-pagination',
  standalone: true,
  imports: [],
  templateUrl: './searching-user-pagination.component.html',
  styleUrl: './searching-user-pagination.component.scss',
})
export class SearchingUserPaginationComponent {

  @Input() currentPage = 1;
  @Input() itemsPerPage = 100;
  @Input() totalItems = 0;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    if (this.totalItems <= 0 || this.itemsPerPage <= 0) {
      return 0;
    }

    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get visiblePages(): (number | 'ellipsis')[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis', total];
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

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  changePage(page: number): void {
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
    if (!this.canGoPrevious) {
      return;
    }

    this.changePage(this.currentPage - 1);
  }

  nextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.changePage(this.currentPage + 1);
  }

  isPage(
    item: number | 'ellipsis'
  ): item is number {
    return typeof item === 'number';
  }
}