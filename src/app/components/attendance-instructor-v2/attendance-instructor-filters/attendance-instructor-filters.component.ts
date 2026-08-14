import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-attendance-instructor-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './attendance-instructor-filters.component.html',
  styleUrl: './attendance-instructor-filters.component.scss',
})
export class AttendanceInstructorFiltersComponent {

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


  /* =========================
     OUTPUTS
  ========================= */

  @Output() instructorInputChange =
    new EventEmitter<string>();

  @Output() instructorSelected =
    new EventEmitter<UserDto>();

  @Output() dropdownHidden =
    new EventEmitter<void>();

  @Output() searchRequested =
    new EventEmitter<void>();


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  onInstructorInputChange(term: string): void {
    this.instructorInputChange.emit(term);
  }

  onSelectInstructor(user: UserDto): void {
    this.instructorSelected.emit(user);
  }

  onInstructorInputBlur(): void {
    this.dropdownHidden.emit();
  }


  /* =========================
     SEARCH
  ========================= */

  onSearch(): void {
    this.searchRequested.emit();
  }


  /* =========================
     CLEAR
  ========================= */

  clearFilters(): void {
    this.filter.instructorName = '';
    this.filter.from = new Date()
      .toISOString()
      .substring(0, 10);
    this.filter.to = '';
    this.filter.present = 'true';

    this.instructorInputChange.emit('');
  }


  /* =========================
     INSTRUCTOR HELPERS
  ========================= */

  getInstructorFullName(user: UserDto): string {
    return [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sin nombre';
  }

  getInstructorInitials(user: UserDto): string {
    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) || '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) || '';

    return `${firstName}${lastName}`
      .toUpperCase() || 'IN';
  }

  getInstructorEmail(user: UserDto): string {
    return (
      user.emailAddress ||
      user.email ||
      'Sin correo'
    );
  }

  getInstructorId(user: UserDto): string {
    return user.instructor?.id
      ? String(user.instructor.id)
      : String(user.id);
  }
}