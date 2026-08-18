import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-statistics-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './statistics-pagination.component.html',
  styleUrl: './statistics-pagination.component.scss',
})
export class StatisticsPaginationComponent implements OnInit {

  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() limit = 10;
  @Input() limitOptions: number[] = [];
  @Input() canPrev = false;
  @Input() canNext = false;
  @Input() paginationLabel = '';

  @Output() pageChange =
    new EventEmitter<number>();

  @Output() previousRequested =
    new EventEmitter<void>();

  @Output() nextRequested =
    new EventEmitter<void>();

  @Output() limitChange =
    new EventEmitter<number>();

  isMobile = false;

  ngOnInit(): void {
    this.updateMobileState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMobileState();
  }

  private updateMobileState(): void {
    this.isMobile =
      window.innerWidth <= 600;
  }

  get visiblePages(): (number | 'ellipsis')[] {
    return this.isMobile
      ? this.mobilePages
      : this.desktopPages;
  }

  private get mobilePages(): (number | 'ellipsis')[] {
    if (this.totalPages <= 4) {
      return Array.from(
        { length: this.totalPages },
        (_, index) => index + 1,
      );
    }

    if (this.page <= 3) {
      return [
        1,
        2,
        3,
        'ellipsis',
        this.totalPages,
      ];
    }

    if (
      this.page >=
      this.totalPages - 1
    ) {
      const start =
        Math.max(
          1,
          this.totalPages - 3,
        );

      return Array.from(
        {
          length:
            this.totalPages - start + 1,
        },
        (_, index) =>
          start + index,
      );
    }

    return [
      this.page - 2,
      this.page - 1,
      this.page,
      'ellipsis',
      this.totalPages,
    ];
  }

  private get desktopPages(): (number | 'ellipsis')[] {
    if (this.totalPages <= 7) {
      return Array.from(
        { length: this.totalPages },
        (_, index) => index + 1,
      );
    }

    if (this.page <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        'ellipsis',
        this.totalPages,
      ];
    }

    if (
      this.page >=
      this.totalPages - 3
    ) {
      return [
        1,
        'ellipsis',
        this.totalPages - 4,
        this.totalPages - 3,
        this.totalPages - 2,
        this.totalPages - 1,
        this.totalPages,
      ];
    }

    return [
      1,
      'ellipsis',
      this.page - 1,
      this.page,
      this.page + 1,
      'ellipsis',
      this.totalPages,
    ];
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

    this.pageChange.emit(
      page,
    );
  }

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

    this.limitChange.emit(
      limit,
    );
  }

  isPage(
    item: number | 'ellipsis',
  ): item is number {
    return (
      typeof item === 'number'
    );
  }
}