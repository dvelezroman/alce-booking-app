import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instructor-scheduling-request-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './instructor-scheduling-request-summary.component.html',
  styleUrl: './instructor-scheduling-request-summary.component.scss',
})
export class InstructorSchedulingRequestSummaryComponent {
  @Input() total: number = 0;
  @Input() rangeLabel: string = '0 resultados';
  @Input() pageSize: number = 25;
  @Input() pageSizeChoices: readonly number[] = [10, 25, 50, 100];
  @Input() loading: boolean = false;

  @Output() pageSizeChange = new EventEmitter<number>();

  onPageSizeChange(value: number | string): void {
    const parsedValue = Number(value);

    if (
      Number.isNaN(parsedValue) ||
      !this.pageSizeChoices.includes(parsedValue)
    ) {
      return;
    }

    this.pageSize = parsedValue;
    this.pageSizeChange.emit(parsedValue);
  }

  get totalLabel(): string {
    return this.total === 1
      ? '1 solicitud'
      : `${this.total} solicitudes`;
  }

  trackByPageSize(
    index: number,
    size: number,
  ): number {
    return size;
  }
}