import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-groups-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './groups-pagination.component.html',
  styleUrl: './groups-pagination.component.scss',
})
export class GroupsPaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() limit = 10;
  @Input() limitOptions: number[] = [10, 20, 50];
  @Input() canPrev = false;
  @Input() canNext = false;

  @Output()
  pageChange =
    new EventEmitter<number>();

  @Output()
  previousRequested =
    new EventEmitter<void>();

  @Output()
  nextRequested =
    new EventEmitter<void>();

  @Output()
  limitChange =
    new EventEmitter<number>();

  onPrevious(): void {
    if (!this.canPrev) {
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

  onFirst(): void {
    if (!this.canPrev) {
      return;
    }

    this.pageChange.emit(1);
  }

  onLast(): void {
    if (!this.canNext) {
      return;
    }

    this.pageChange.emit(
      this.totalPages,
    );
  }

  onPage(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.pageChange.emit(page);
  }

  onLimit(
    value: number,
  ): void {
    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limitChange.emit(limit);
  }

  get visiblePages(): number[] {
    if (
      this.totalPages <= 5
    ) {
      return Array.from(
        {
          length:
            this.totalPages,
        },
        (_, index) =>
          index + 1,
      );
    }

    let start =
      Math.max(
        1,
        this.page - 2,
      );

    let end =
      Math.min(
        this.totalPages,
        start + 4,
      );

    if (
      end - start < 4
    ) {
      start =
        Math.max(
          1,
          end - 4,
        );
    }

    return Array.from(
      {
        length:
          end - start + 1,
      },
      (_, index) =>
        start + index,
    );
  }

  get paginationLabel(): string {
    if (!this.total) {
      return '0 grupos';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} grupos`
    );
  }
}