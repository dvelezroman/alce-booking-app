import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-stages-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stages-pagination.component.html',
  styleUrl: './stages-pagination.component.scss',
})
export class StagesPaginationComponent
  implements OnInit, OnChanges {

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
  limit = 10;

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


  /* =========================
     RESPONSIVE
  ========================= */

  isMobile = false;


  ngOnInit(): void {
    this.updateResponsiveState();
  }


  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    if (
      changes['page'] ||
      changes['totalPages']
    ) {
      this.normalizeValues();
    }
  }


  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateResponsiveState();
  }


  private updateResponsiveState(): void {
    if (
      typeof window === 'undefined'
    ) {
      return;
    }

    this.isMobile =
      window.innerWidth <= 600;
  }


  private normalizeValues(): void {
    if (this.totalPages < 1) {
      this.totalPages = 1;
    }

    if (this.page < 1) {
      this.page = 1;
    }

    if (
      this.page >
      this.totalPages
    ) {
      this.page =
        this.totalPages;
    }
  }


  /* =========================
     VISIBLE PAGES
  ========================= */

  get visiblePages():
    Array<number | 'ellipsis'> {

    return this.isMobile
      ? this.mobilePages
      : this.desktopPages;
  }


  /* =========================
     DESKTOP PAGES
  ========================= */

  private get desktopPages():
    Array<number | 'ellipsis'> {

    const total =
      this.totalPages;

    const current =
      this.page;


    if (total <= 7) {
      return Array.from(
        {
          length: total,
        },
        (_, index) =>
          index + 1,
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


    if (
      current >=
      total - 3
    ) {
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
     MOBILE PAGES
  ========================= */

  private get mobilePages():
    Array<number | 'ellipsis'> {

    const total =
      this.totalPages;

    const current =
      this.page;


    /*
     * Pocas páginas:
     * mostramos todas.
     */
    if (total <= 4) {
      return Array.from(
        {
          length: total,
        },
        (_, index) =>
          index + 1,
      );
    }


    /*
     * Inicio:
     *
     * 1 2 3 ... 12
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
     * Final:
     *
     * 1 ... 10 11 12
     */
    if (
      current >=
      total - 1
    ) {
      return [
        1,
        'ellipsis',
        total - 2,
        total - 1,
        total,
      ];
    }


    /*
     * Intermedio:
     *
     * 1 ... 5 ... 12
     */
    return [
      1,
      'ellipsis',
      current,
      'ellipsis',
      total,
    ];
  }


  /* =========================
     PAGE ACTION
  ========================= */

  selectPage(
    value:
      number |
      'ellipsis',
  ): void {

    if (
      value === 'ellipsis'
    ) {
      return;
    }


    if (
      value < 1 ||
      value > this.totalPages ||
      value === this.page
    ) {
      return;
    }


    this.pageChange.emit(
      value,
    );
  }


  /* =========================
     PREVIOUS
  ========================= */

  previous(): void {
    if (!this.canPrev) {
      return;
    }

    this.previousRequested.emit();
  }


  /* =========================
     NEXT
  ========================= */

  next(): void {
    if (!this.canNext) {
      return;
    }

    this.nextRequested.emit();
  }


  /* =========================
     RANGE
  ========================= */

  get startIndex(): number {
    if (!this.total) {
      return 0;
    }

    return (
      (this.page - 1) *
      this.limit
    ) + 1;
  }


  get endIndex(): number {
    return Math.min(
      this.page *
      this.limit,
      this.total,
    );
  }


  /* =========================
     RESULTS LABEL
  ========================= */

  get resultsLabel(): string {
    if (!this.total) {
      return 'No hay resultados';
    }

    return (
      `Mostrando ${this.startIndex} ` +
      `a ${this.endIndex} ` +
      `de ${this.total} resultados`
    );
  }
}