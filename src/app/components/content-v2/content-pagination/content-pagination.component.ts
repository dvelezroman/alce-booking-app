import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-content-pagination',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './content-pagination.component.html',
  styleUrl: './content-pagination.component.scss',
})
export class ContentPaginationComponent implements OnInit {

  /* =========================
     INPUTS
  ========================= */

  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() limit = 10;

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

  isMobile = false;


  ngOnInit(): void {
    this.updateResponsiveState();
  }


  @HostListener('window:resize')
  onResize(): void {
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


  /* =========================
     PAGES
  ========================= */

  get visiblePages():
    Array<number | 'ellipsis'> {

    return this.isMobile
      ? this.mobilePages
      : this.desktopPages;
  }


  /* =========================
     DESKTOP
  ========================= */

  private get desktopPages():
    Array<number | 'ellipsis'> {

    const total =
      this.totalPages;

    const current =
      this.page;

    if (total <= 7) {
      return Array.from(
        { length: total },
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
     MOBILE
     MAX 3 NUMERIC BUTTONS
  ========================= */

  private get mobilePages():
    Array<number | 'ellipsis'> {

    const total =
      this.totalPages;

    const current =
      this.page;


    if (total <= 3) {
      return Array.from(
        { length: total },
        (_, index) =>
          index + 1,
      );
    }


    /*
     * Inicio:
     * 1 2 ... 7
     *
     * 3 botones numéricos:
     * 1, 2, 7
     */
    if (current <= 2) {
      return [
        1,
        2,
        'ellipsis',
        total,
      ];
    }


    /*
     * Final:
     * 1 ... 6 7
     *
     * 3 botones numéricos:
     * 1, 6, 7
     */
    if (
      current >=
      total - 1
    ) {
      return [
        1,
        'ellipsis',
        total - 1,
        total,
      ];
    }


    /*
     * Centro:
     * 1 ... 4 ... 7
     *
     * 3 botones numéricos:
     * 1, actual, última
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
     ACTIONS
  ========================= */

  selectPage(
    value:
      number |
      'ellipsis',
  ): void {

    if (
      value === 'ellipsis' ||
      value === this.page
    ) {
      return;
    }

    this.pageChange.emit(
      value,
    );
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
}