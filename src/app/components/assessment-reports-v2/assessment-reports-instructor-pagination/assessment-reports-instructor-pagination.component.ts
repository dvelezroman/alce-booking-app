import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-reports-instructor-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-reports-instructor-pagination.component.html',
  styleUrl: './assessment-reports-instructor-pagination.component.scss',
})
export class AssessmentReportsInstructorPaginationComponent {

  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() total = 0;
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() limit = 10;

  @Input() canPrev = false;
  @Input() canNext = false;

  @Input() paginationLabel =
    '0 evaluaciones';

  @Input() limitOptions: number[] = [
    5,
    10,
    20,
    50,
  ];


  @Output() pageChange =
    new EventEmitter<number>();

  @Output() previousRequested =
    new EventEmitter<void>();

  @Output() nextRequested =
    new EventEmitter<void>();

  @Output() limitChange =
    new EventEmitter<number>();


  get pages(): number[] {
    const total =
      Math.max(
        1,
        this.totalPages,
      );

    const current =
      Math.min(
        Math.max(
          1,
          this.page,
        ),
        total,
      );

    const start =
      Math.max(
        1,
        Math.min(
          current - 2,
          total - 4,
        ),
      );

    const end =
      Math.min(
        total,
        start + 4,
      );

    const result: number[] = [];

    for (
      let page = start;
      page <= end;
      page++
    ) {
      result.push(page);
    }

    return result;
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


  onPageChange(
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


  onLimitChange(
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

    this.limitChange.emit(
      limit,
    );
  }
}