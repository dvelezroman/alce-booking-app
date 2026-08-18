import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  Stage,
} from '../../../services/dtos/student.dto';


@Component({
  selector: 'app-content-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './content-filters.component.html',
  styleUrl: './content-filters.component.scss',
})
export class ContentFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  form!: FormGroup;

  @Input()
  stages: Stage[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  searchRequested =
    new EventEmitter<void>();

  @Output()
  clearRequested =
    new EventEmitter<void>();


  /* =========================
     LOCAL STATE
  ========================= */

  selectedStatus:
    'all' |
    'enabled' |
    'disabled' =
    'all';


  /* =========================
     UNITS
  ========================= */

  readonly unitOptions = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
  ];


  /* =========================
     ACTIONS
  ========================= */

  search(): void {
    this.searchRequested.emit();
  }


  clear(): void {
    this.selectedStatus = 'all';

    this.clearRequested.emit();
  }


  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {
    return (
      stage.description ||
      stage.number ||
      `Stage ${stage.id}`
    );
  }


  /* =========================
     STATE
  ========================= */

  get hasFilters(): boolean {
    return !!(
      this.form?.get('stageId')?.value ||
      this.form?.get('unit')?.value ||
      this.selectedStatus !== 'all'
    );
  }
}