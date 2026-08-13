import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-notification-sent-pagination',
  standalone: true,
  imports: [],
  templateUrl: './notification-sent-pagination.component.html',
  styleUrl: './notification-sent-pagination.component.scss',
})
export class NotificationSentPaginationComponent {

  @Input() page = 1;
  @Input() limit = 20;
  @Input() total = 0;
  @Input() startIndex = 0;
  @Input() endIndex = 0;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onPrev(): void {
    this.prev.emit();
  }

  onNext(): void {
    this.next.emit();
  }

  onLimitChange(value: string): void {
    const newLimit = Number(value);

    if (!newLimit || newLimit === this.limit) return;

    this.pageSizeChange.emit(newLimit);
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
}