import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stage-resources-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './stage-resources-filters.component.html',
  styleUrl: './stage-resources-filters.component.scss'
})
export class StageResourcesFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() selectedStageId: number | null = null;

  @Input() selectedStatus = 'all';


  /* =========================
     OUTPUTS
  ========================= */

  @Output() stageChange =
    new EventEmitter<number | null>();

  @Output() statusChange =
    new EventEmitter<string>();

  @Output() search =
    new EventEmitter<void>();

  @Output() clearFilters =
    new EventEmitter<void>();


  /* =========================
     STAGES
  ========================= */

  stages = [
    { id: 1, label: 'Stage 1' },
    { id: 2, label: 'Stage 2' },
    { id: 3, label: 'Stage 3' },
    { id: 4, label: 'Stage 4' },
    { id: 5, label: 'Stage 5' },
    { id: 6, label: 'Stage 6' },
    { id: 7, label: 'Stage 7' },
    { id: 8, label: 'Stage 8' }
  ];


  /* =========================
     EVENTS
  ========================= */

  onStageChange(
    value: string | number | null
  ): void {

    const stageId =
      value === '' ||
      value === null
        ? null
        : Number(value);

    this.selectedStageId = stageId;

    this.stageChange.emit(stageId);
  }


  onStatusChange(
    value: string
  ): void {

    this.selectedStatus = value;

    this.statusChange.emit(value);
  }


  onSearch(): void {
    this.search.emit();
  }


  onClearFilters(): void {

    this.selectedStageId = null;
    this.selectedStatus = 'all';

    this.stageChange.emit(null);
    this.statusChange.emit('all');

    this.clearFilters.emit();
  }

}