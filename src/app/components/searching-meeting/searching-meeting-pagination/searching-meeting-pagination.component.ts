import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-searching-meeting-pagination',
  standalone: true,
  imports: [],
  templateUrl: './searching-meeting-pagination.component.html',
  styleUrl: './searching-meeting-pagination.component.scss',
})
export class SearchingMeetingPaginationComponent {

  @Input()
  page = 1;

  @Input()
  limit = 15;

  @Input()
  total = 0;

  @Input()
  startIndex = 0;

  @Input()
  endIndex = 0;

  @Output()
  prev = new EventEmitter<void>();

  @Output()
  next = new EventEmitter<void>();

  @Output()
  pageChange = new EventEmitter<number>();

  @Output()
  limitChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total / this.limit,
      ),
    );
  }

  get canGoPrev(): boolean {
    return this.page > 1;
  }

  get canGoNext(): boolean {
    return this.page < this.totalPages;
  }

  get visiblePages(): number[] {
    if (this.totalPages <= 5) {
      return Array.from(
        {
          length: this.totalPages,
        },
        (_, index) => index + 1,
      );
    }

    const start = Math.max(
      1,
      Math.min(
        this.page - 2,
        this.totalPages - 4,
      ),
    );

    return Array.from(
      {
        length: 5,
      },
      (_, index) => start + index,
    );
  }

  onPrev(): void {
    if (!this.canGoPrev) {
      return;
    }

    this.prev.emit();
  }

  onNext(): void {
    if (!this.canGoNext) {
      return;
    }

    this.next.emit();
  }

  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.pageChange.emit(
      page,
    );
  }

  onLimitChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    const limit =
      Number(
        select.value,
      );

    if (
      !limit ||
      limit === this.limit
    ) {
      return;
    }

    this.limitChange.emit(
      limit,
    );
  }
}