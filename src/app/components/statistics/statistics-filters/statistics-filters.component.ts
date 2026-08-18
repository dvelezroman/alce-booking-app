import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  EvaluationStatisticsFilterDto,
} from '../../../services/dtos/instructor-evaluation.dto';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-statistics-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './statistics-filters.component.html',
  styleUrl: './statistics-filters.component.scss',
})
export class StatisticsFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() filteredInstructors:
    UserDto[] = [];

  @Input() showInstructorDropdown =
    false;

  @Input() isInstructorFieldInvalid =
    false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() filtersSubmitted =
    new EventEmitter<EvaluationStatisticsFilterDto>();

  @Output() instructorInputChange =
    new EventEmitter<string>();

  @Output() instructorSelected =
    new EventEmitter<UserDto>();

  @Output() instructorDropdownHidden =
    new EventEmitter<void>();


  /* =========================
     FILTER
  ========================= */

  instructorSearch = '';

  selectedInstructorId:
    number | undefined;

  from = '';

  to = '';

  minAverageRating:
    number | null = null;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor() {

    const {
      from,
      to
    } =
      this.getDefaultDateRange();

    this.from =
      from;

    this.to =
      to;
  }


  /* =========================
     DEFAULT RANGE
  ========================= */

  private getDefaultDateRange(): {
    from: string;
    to: string;
  } {

    const today =
      new Date();

    const to =
      today
        .toISOString()
        .split('T')[0];

    const fromDate =
      new Date();

    fromDate.setDate(
      today.getDate() - 20
    );

    const from =
      fromDate
        .toISOString()
        .split('T')[0];

    return {
      from,
      to
    };
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  onInstructorInputChange(
    term: string
  ): void {

    this.instructorSearch =
      term;

    this.selectedInstructorId =
      undefined;

    this.instructorInputChange.emit(
      term
    );
  }


  onSelectInstructor(
    user: UserDto
  ): void {

    this.instructorSearch =
      this.getInstructorFullName(
        user
      );

    this.selectedInstructorId =
      user.instructor?.id;

    this.instructorSelected.emit(
      user
    );
  }


  onInstructorInputBlur(): void {

    this.instructorDropdownHidden.emit();
  }


  /* =========================
     SEARCH
  ========================= */

  onSearch(): void {

    const filters:
      EvaluationStatisticsFilterDto = {

      from:
        this.from ||
        undefined,

      to:
        this.to ||
        undefined,

      instructorId:
        this.selectedInstructorId ||
        undefined,

      minAverageRating:
        this.minAverageRating ??
        undefined,
    };


    this.filtersSubmitted.emit(
      filters
    );
  }


  /* =========================
     CLEAR
  ========================= */

  onClear(): void {

    const {
      from,
      to
    } =
      this.getDefaultDateRange();


    this.instructorSearch =
      '';

    this.selectedInstructorId =
      undefined;

    this.from =
      from;

    this.to =
      to;

    this.minAverageRating =
      null;


    this.instructorInputChange.emit(
      ''
    );


    this.filtersSubmitted.emit({
      from,
      to
    });
  }


  /* =========================
     HELPERS
  ========================= */

  getInstructorFullName(
    user: UserDto
  ): string {

    return [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Sin nombre';
  }


  getInstructorInitials(
    user: UserDto
  ): string {

    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) ||
      '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) ||
      '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'IN'
    );
  }


  getInstructorEmail(
    user: UserDto
  ): string {

    return (
      user.emailAddress ||
      user.email ||
      'Sin correo'
    );
  }
}