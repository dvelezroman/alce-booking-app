import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-stages-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stages-filters.component.html',
  styleUrl: './stages-filters.component.scss',
})
export class StagesFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  searchTerm = '';

  @Input()
  limit = 10;

  @Input()
  limitOptions: number[] = [
    10,
    20,
    50,
    100,
  ];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  searchChange =
    new EventEmitter<string>();

  @Output()
  clearRequested =
    new EventEmitter<void>();

  @Output()
  limitChange =
    new EventEmitter<number>();


  /* =========================
     SEARCH
  ========================= */

  onSearchChange(
    value: string,
  ): void {
    this.searchChange.emit(value);
  }


  clearSearch(): void {
    this.clearRequested.emit();
  }


  /* =========================
     LIMIT
  ========================= */

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