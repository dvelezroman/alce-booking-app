import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-stage-assessment-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-assessment-pagination.component.html',
  styleUrl: './stage-assessment-pagination.component.scss',
})
export class StageAssessmentPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  page = 1;

  @Input()
  totalPages = 1;

  @Input()
  startIndex = 0;

  @Input()
  endIndex = 0;

  @Input()
  total = 0;

  @Input()
  canPrev = false;

  @Input()
  canNext = false;

  @Input()
  paginationLabel = '0 estudiantes';


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


  /* =========================
     PAGE NUMBERS
  ========================= */

  get visiblePages(): Array<number | 'ellipsis'> {
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

    if (current <= 3) {
      return [
        1,
        2,
        3,
        'ellipsis',
        total,
      ];
    }

    if (current >= total - 2) {
      return [
        1,
        'ellipsis',
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      'ellipsis',
      current,
      'ellipsis',
      total,
    ];
  }


  /* =========================
     PAGE SELECT
  ========================= */

  onPageSelect(
    page: number | 'ellipsis',
  ): void {
    if (
      page === 'ellipsis' ||
      page === this.page ||
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.pageChange.emit(
      page,
    );
  }


  /* =========================
     PREVIOUS
  ========================= */

  onPrevious(): void {
    if (!this.canPrev) {
      return;
    }

    this.previousRequested.emit();
  }


  /* =========================
     NEXT
  ========================= */

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.nextRequested.emit();
  }


  /* =========================
     TRACK
  ========================= */

  trackPage(
    index: number,
    item: number | 'ellipsis',
  ): string {
    return `${index}-${item}`;
  }
}