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
  UserDto,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-report-instructor-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './report-instructor-filters.component.html',
  styleUrl: './report-instructor-filters.component.scss',
})
export class ReportInstructorFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() filter: {
    instructorName: string;
    from: string;
    to: string;
    present: string;
  } = {
    instructorName: '',
    from: '',
    to: '',
    present: 'true',
  };

  @Input() filteredInstructors: UserDto[] = [];

  @Input() showDropdown = false;

  @Input() isNameFieldInvalid = false;

  @Input() showFromError = false;

  @Input() showToError = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() instructorInputChange =
    new EventEmitter<void>();

  @Output() instructorSelected =
    new EventEmitter<UserDto>();

  @Output() dropdownHidden =
    new EventEmitter<void>();

  @Output() searchRequested =
    new EventEmitter<void>();


  /* =========================
     EVENTS
  ========================= */

  onInstructorInputChange(): void {
    this.instructorInputChange.emit();
  }

  onSelectInstructor(
    instructor: UserDto,
  ): void {
    this.instructorSelected.emit(
      instructor,
    );
  }

  onBlur(): void {
    this.dropdownHidden.emit();
  }

  onSearch(): void {
    this.searchRequested.emit();
  }


  /* =========================
     HELPERS
  ========================= */

  getInstructorFullName(
    instructor: UserDto,
  ): string {
    return [
      instructor.firstName,
      instructor.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sin nombre';
  }

  getInstructorInitials(
    instructor: UserDto,
  ): string {
    const first =
      instructor.firstName
        ?.trim()
        .charAt(0) || '';

    const last =
      instructor.lastName
        ?.trim()
        .charAt(0) || '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'IN'
    );
  }

  getInstructorEmail(
    instructor: UserDto,
  ): string {
    return (
      instructor.emailAddress ||
      instructor.email ||
      'Sin correo'
    );
  }
}