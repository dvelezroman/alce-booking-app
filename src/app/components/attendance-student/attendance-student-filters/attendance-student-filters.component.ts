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
  selector: 'app-attendance-student-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './attendance-student-filters.component.html',
  styleUrl: './attendance-student-filters.component.scss',
})
export class AttendanceStudentFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() filter: {
    studentName: string;
    from: string;
    to: string;
    hour: string;
  } = {
    studentName: '',
    from: '',
    to: '',
    hour: '',
  };

  @Input() availableHours: number[] = [];
  @Input() filteredStudents: UserDto[] = [];
  @Input() showDropdown = false;
  @Input() isNameFieldInvalid = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() studentInputChange =
    new EventEmitter<string>();

  @Output() studentSelected =
    new EventEmitter<UserDto>();

  @Output() dropdownHidden =
    new EventEmitter<void>();

  @Output() searchRequested =
    new EventEmitter<void>();


  /* =========================
     STUDENT SEARCH
  ========================= */

  onStudentInputChange(term: string): void {
    this.studentInputChange.emit(term);
  }

  onSelectStudent(user: UserDto): void {
    this.studentSelected.emit(user);
  }

  onStudentInputBlur(): void {
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
    this.filter.studentName = '';
    this.filter.from = '';
    this.filter.to = '';
    this.filter.hour = '';

    this.studentInputChange.emit('');
  }


  /* =========================
     HELPERS
  ========================= */

  getStudentFullName(user: UserDto): string {
    return [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sin nombre';
  }

  getStudentInitials(user: UserDto): string {
    const firstName =
      user.firstName?.trim()?.charAt(0) || '';

    const lastName =
      user.lastName?.trim()?.charAt(0) || '';

    return `${firstName}${lastName}`.toUpperCase() || 'E';
  }

  getStudentId(user: UserDto): string {
    return user.idNumber || String(user.id);
  }


  /* =========================
     HOUR
  ========================= */

  formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';

    const normalizedHour =
      hour > 12
        ? hour - 12
        : hour === 0
          ? 12
          : hour;

    return `${normalizedHour}:00 ${period}`;
  }
}