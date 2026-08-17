import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-links-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './links-pagination.component.html',
  styleUrl: './links-pagination.component.scss',
})
export class LinksPaginationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() limit = 10;

  @Input()
  limitOptions: number[] = [
    10,
    20,
    50,
    100,
  ];

  @Input() canPrev = false;
  @Input() canNext = false;

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
     RESPONSIVE
  ========================= */

  isMobile =
    typeof window !== 'undefined'
      ? window.innerWidth <= 700
      : false;


  @HostListener(
    'window:resize',
  )
  onResize(): void {
    this.isMobile =
      window.innerWidth <= 700;
  }


  /* =========================
     PAGES
  ========================= */

  get visiblePages(): Array<number | 'ellipsis'> {
    return this.isMobile
      ? this.mobilePages
      : this.desktopPages;
  }


  /* =========================
     MOBILE PAGES
  ========================= */

  private get mobilePages(): Array<number | 'ellipsis'> {
    const total =
      this.totalPages;

    const current =
      this.page;

    /*
     * 1, 2, 3
     */
    if (total <= 3) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    /*
     * Primeras páginas:
     *
     * 1 2 3 ... 7
     */
    if (current <= 2) {
      return [
        1,
        2,
        3,
        'ellipsis',
        total,
      ];
    }

    /*
     * Últimas páginas:
     *
     * 1 ... 5 6 7
     */
    if (current >= total - 1) {
      return [
        1,
        'ellipsis',
        total - 2,
        total - 1,
        total,
      ];
    }

    /*
     * Zona intermedia:
     *
     * 1 ... 3 4 5 ... 7
     *
     * En pantallas pequeñas queremos
     * evitar demasiados botones.
     */
    return [
      current - 1,
      current,
      current + 1,
      'ellipsis',
      total,
    ];
  }


  /* =========================
     DESKTOP PAGES
  ========================= */

  private get desktopPages(): Array<number | 'ellipsis'> {
    const total =
      this.totalPages;

    const current =
      this.page;

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
     ACTIONS
  ========================= */

  selectPage(
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


  previous(): void {
    if (!this.canPrev) {
      return;
    }

    this.previousRequested.emit();
  }


  next(): void {
    if (!this.canNext) {
      return;
    }

    this.nextRequested.emit();
  }


  first(): void {
    if (!this.canPrev) {
      return;
    }

    this.pageChange.emit(1);
  }


  last(): void {
    if (!this.canNext) {
      return;
    }

    this.pageChange.emit(
      this.totalPages,
    );
  }


  onLimitChange(
    value: number | string,
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
}