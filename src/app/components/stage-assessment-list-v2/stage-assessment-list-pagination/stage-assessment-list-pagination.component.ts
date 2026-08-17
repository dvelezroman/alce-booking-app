import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-stage-assessment-list-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stage-assessment-list-pagination.component.html',
  styleUrl: './stage-assessment-list-pagination.component.scss',
})
export class StageAssessmentListPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;

  @Input() canPrev = false;
  @Input() canNext = false;

  @Input() paginationLabel = '';

  @Input() limit = 20;
  @Input() limitOptions: number[] = [
    10,
    20,
    50,
    100,
  ];


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
     VISIBLE PAGES
  ========================= */

  get visiblePages(): Array<number | 'ellipsis'> {
    const total = this.totalPages;
    const current = this.page;

    if (total <= 5) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
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
     PAGE
  ========================= */

  goToPage(
    page: number | 'ellipsis',
  ): void {
    if (
      page === 'ellipsis' ||
      page === this.page
    ) {
      return;
    }

    this.pageChange.emit(page);
  }


  /* =========================
     PREVIOUS / NEXT
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


  /* =========================
     LIMIT
  ========================= */

  onLimitChange(
    value: number | string,
  ): void {
    const limit = Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limitChange.emit(limit);
  }
}