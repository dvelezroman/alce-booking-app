import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './events-pagination.component.html',
  styleUrl: './events-pagination.component.scss',
})
export class EventsPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  currentPage: number = 1;

  @Input()
  totalPages: number = 1;

  @Input()
  itemsPerPage: number = 10;

  @Input()
  itemsPerPageOptions: number[] = [
    10,
    25,
    50,
    100,
  ];

  @Input()
  rangeLabel: string = '';

  @Input()
  canPreviousPage: boolean = false;

  @Input()
  canNextPage: boolean = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  pageChange =
    new EventEmitter<number>();

  @Output()
  itemsPerPageChange =
    new EventEmitter<number>();

  @Output()
  previousRequested =
    new EventEmitter<void>();

  @Output()
  nextRequested =
    new EventEmitter<void>();


  /* =========================
     PAGE SIZE
  ========================= */

  onItemsPerPageChange(
    value: string | number,
  ): void {
    const size = Number(value);

    if (
      !Number.isFinite(size) ||
      size <= 0
    ) {
      return;
    }

    this.itemsPerPageChange.emit(
      size,
    );
  }


  /* =========================
     PAGE CHANGE
  ========================= */

  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
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
    if (!this.canPreviousPage) {
      return;
    }

    this.previousRequested.emit();
  }


  /* =========================
     NEXT
  ========================= */

  onNext(): void {
    if (!this.canNextPage) {
      return;
    }

    this.nextRequested.emit();
  }


  /* =========================
     VISIBLE PAGES
  ========================= */

  get visiblePages(): Array<number | 'ellipsis'> {
  const total = this.totalPages;
  const current = this.currentPage;

  const isMobile =
    typeof window !== 'undefined' &&
    window.innerWidth <= 640;

  /* =========================
     MOBILE
  ========================= */

    if (isMobile) {
      if (total <= 4) {
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
      DESKTOP / TABLET
    ========================= */

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 4) {
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


  /* =========================
     STATE
  ========================= */

  get hasMultiplePages(): boolean {
    return this.totalPages > 1;
  }
}