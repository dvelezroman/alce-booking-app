import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-platform-assessment-list-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './platform-assessment-list-pagination.component.html',
  styleUrl: './platform-assessment-list-pagination.component.scss',
})
export class PlatformAssessmentListPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  page = 1;

  @Input()
  totalPages = 1;

  @Input()
  total = 0;

  @Input()
  limit = 20;

  @Input()
  limitOptions: number[] = [
    10,
    20,
    50,
    100,
  ];

  @Input()
  canPrev = false;

  @Input()
  canNext = false;

  @Input()
  paginationLabel = '';


  /* =========================
     OUTPUTS
  ========================= */

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


  /* =========================
     ACTIONS
  ========================= */

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


  onLimitChange(
    value: number | string,
  ): void {
    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0 ||
      limit === this.limit
    ) {
      return;
    }

    this.limitChange.emit(limit);
  }


  /* =========================
     PAGES
  ========================= */

  get visiblePages(): number[] {
    const total =
      this.totalPages;

    const current =
      this.page;

    if (total <= 5) {
      return Array.from(
        {
          length: total,
        },
        (_, index) =>
          index + 1,
      );
    }

    let start =
      Math.max(
        1,
        current - 2,
      );

    let end =
      Math.min(
        total,
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


  /* =========================
     ELLIPSIS
  ========================= */

  get showStartEllipsis(): boolean {
    return (
      this.visiblePages.length > 0 &&
      this.visiblePages[0] > 1
    );
  }


  get showEndEllipsis(): boolean {
    if (
      this.visiblePages.length === 0
    ) {
      return false;
    }

    return (
      this.visiblePages[
        this.visiblePages.length - 1
      ] < this.totalPages
    );
  }


  /* =========================
     FIRST / LAST PAGE
  ========================= */

  onFirst(): void {
    if (this.page === 1) {
      return;
    }

    this.pageChange.emit(1);
  }


  onLast(): void {
    if (
      this.page ===
      this.totalPages
    ) {
      return;
    }

    this.pageChange.emit(
      this.totalPages,
    );
  }
}