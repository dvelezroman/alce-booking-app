import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inbox-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inbox-pagination.component.html',
  styleUrls: ['./inbox-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InboxPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Input() total = 0;
  @Input() limit = 20;

  @Input() startIndex = 0;
  @Input() endIndex = 0;

  @Input() hasPreviousPage = false;
  @Input() hasNextPage = false;

  @Input() limitOptions: number[] = [
    10,
    20,
    30,
    50,
  ];

  @Output()
  previousPage = new EventEmitter<void>();

  @Output()
  nextPage = new EventEmitter<void>();

  @Output()
  pageChange = new EventEmitter<number>();

  @Output()
  limitChange = new EventEmitter<number>();

  get visiblePages(): Array<number | 'ellipsis'> {
    const totalPages = Math.max(
      this.totalPages,
      1
    );

    const currentPage = Math.min(
      Math.max(this.currentPage, 1),
      totalPages
    );

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [
        1,
        2,
        3,
        'ellipsis',
        totalPages,
      ];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        'ellipsis',
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      'ellipsis',
      currentPage,
      'ellipsis',
      totalPages,
    ];
  }

  get resultsLabel(): string {
    if (this.total <= 0) {
      return 'No hay notificaciones';
    }

    const safeStartIndex = Math.max(
      this.startIndex,
      1
    );

    const safeEndIndex = Math.min(
      Math.max(this.endIndex, safeStartIndex),
      this.total
    );

    return `Mostrando ${safeStartIndex} a ${safeEndIndex} de ${this.total} notificaciones`;
  }

  get isPaginationDisabled(): boolean {
    return this.totalPages <= 1;
  }

  onPreviousPage(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.previousPage.emit();
  }

  onNextPage(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.nextPage.emit();
  }

  onPageSelect(
    page: number | 'ellipsis'
  ): void {
    if (
      page === 'ellipsis' ||
      page === this.currentPage ||
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.pageChange.emit(page);
  }

  onLimitSelect(
    event: Event
  ): void {
    const selectElement =
      event.target as HTMLSelectElement;

    const selectedLimit = Number(
      selectElement.value
    );

    if (
      !Number.isFinite(selectedLimit) ||
      selectedLimit <= 0 ||
      selectedLimit === this.limit
    ) {
      return;
    }

    this.limitChange.emit(selectedLimit);
  }

  trackByPage(
    index: number,
    page: number | 'ellipsis'
  ): string {
    return `${page}-${index}`;
  }
}