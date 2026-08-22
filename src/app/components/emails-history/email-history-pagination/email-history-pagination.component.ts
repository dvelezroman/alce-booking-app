import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-history-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './email-history-pagination.component.html',
  styleUrl:
    './email-history-pagination.component.scss',
})
export class EmailHistoryPaginationComponent {

  @Input()
  page = 1;

  @Input()
  limit = 0;

  @Input()
  total = 0;

  @Input()
  startIndex = 0;

  @Input()
  endIndex = 0;

  @Output()
  previousRequested =
    new EventEmitter<void>();

  @Output()
  nextRequested =
    new EventEmitter<void>();


  get totalPages(): number {
    if (
      !this.limit ||
      !this.total
    ) {
      return 0;
    }

    return Math.ceil(
      this.total /
      this.limit,
    );
  }


  get canPrevious(): boolean {
    return this.page > 1;
  }


  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  onPrevious(): void {
    if (!this.canPrevious) {
      return;
    }

    this.previousRequested.emit();
  }


  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.nextRequested.emit();
  }
}