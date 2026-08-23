import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  Mode,
  StudentClassification,
} from '../../../../services/dtos/student.dto';

import {
  City,
} from '../../../../services/dtos/handle-date.dto';


@Component({
  selector: 'app-feature-flag-restriction-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './feature-flag-restriction-filters.component.html',
  styleUrl: './feature-flag-restriction-filters.component.scss',
})
export class FeatureFlagRestrictionFiltersComponent {

  @Input()
  selectedStudentClassification:
    StudentClassification | null = null;

  @Input()
  selectedMode:
    Mode | null = null;

  @Input()
  selectedCity:
    City | null = null;

  @Output()
  classificationChange =
    new EventEmitter<StudentClassification | null>();

  @Output()
  modeChange =
    new EventEmitter<Mode | null>();

  @Output()
  cityChange =
    new EventEmitter<City | null>();

  @Output()
  refreshRequested =
    new EventEmitter<void>();


  onClassificationChange(
    value:
      StudentClassification | null,
  ): void {

    this.classificationChange.emit(
      value,
    );

    this.refreshRequested.emit();
  }


  onModeChange(
    value:
      Mode | null,
  ): void {

    this.modeChange.emit(
      value,
    );

    this.refreshRequested.emit();
  }


  onCityChange(
    value:
      City | null,
  ): void {

    this.cityChange.emit(
      value,
    );

    this.refreshRequested.emit();
  }
}