import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-notification-historial-pagination',
  standalone: true,
  imports: [],
  templateUrl: './notification-historial-pagination.component.html',
  styleUrl: './notification-historial-pagination.component.scss',
})
export class NotificationHistorialPaginationComponent {

  @Input() page = 1;
  @Input() limit = 10;
  @Input() total = 0;
  @Input() startIndex = 0;
  @Input() endIndex = 0;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  onPrev(): void {
    if (!this.canGoPrev) return;

    this.prev.emit();
  }

  onNext(): void {
    if (!this.canGoNext) return;

    this.next.emit();
  }

  onPageChange(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.pageChange.emit(page);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.total / this.limit),
    );
  }

  get canGoPrev(): boolean {
    return this.page > 1;
  }

  get canGoNext(): boolean {
    return this.page < this.totalPages;
  }

  get resultsLabel(): string {
    if (this.total === 0) {
      return 'No hay resultados';
    }

    return `Mostrando ${this.startIndex} a ${this.endIndex} de ${this.total} resultados`;
  }

  get visiblePages(): (number | 'ellipsis')[] {
    const total = this.totalPages;
    const current = this.page;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 5) {
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

    if (current >= total - 4) {
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
}