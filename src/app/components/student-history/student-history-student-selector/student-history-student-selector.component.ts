import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-student-history-student-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './student-history-student-selector.component.html',
  styleUrl: './student-history-student-selector.component.scss'
})
export class StudentHistoryStudentSelectorComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() searchTerm = '';

  @Input() filteredUsers: UserDto[] = [];

  @Input() showDropdown = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() searchChange =
    new EventEmitter<string>();

  @Output() studentSelected =
    new EventEmitter<UserDto>();

  @Output() dropdownHidden =
    new EventEmitter<void>();


  /* =========================
     SEARCH
  ========================= */

  onSearchChange(
    value: string
  ): void {
    this.searchChange.emit(value);
  }


  onFocus(): void {
    if (
      this.searchTerm.trim().length >= 2 &&
      this.filteredUsers.length
    ) {
      // El padre controla finalmente showDropdown.
      this.searchChange.emit(this.searchTerm);
    }
  }


  onBlur(): void {
    this.dropdownHidden.emit();
  }


  /* =========================
     SELECT
  ========================= */

  selectStudent(
    user: UserDto
  ): void {
    this.studentSelected.emit(user);
  }


  /* =========================
     USER HELPERS
  ========================= */

  getUserName(
    user: UserDto
  ): string {
    const firstName =
      user.firstName?.trim() || '';

    const lastName =
      user.lastName?.trim() || '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName || 'Estudiante';
  }


  getUserEmail(
    user: UserDto
  ): string {
    return user.email || 'Sin correo registrado';
  }


  getStudentId(
    user: UserDto
  ): number | string {
    return user.student?.id ?? '—';
  }


  getStage(
    user: UserDto
  ): string {
    const student =
      user.student as any;

    const stage =
      student?.stage ??
      student?.currentStage;

    const stageNumber =
      stage?.stageNumber ??
      stage?.number ??
      student?.stageId;

    if (!stageNumber) {
      return '';
    }

    return `STG ${stageNumber}`;
  }


  getInitials(
    user: UserDto
  ): string {
    const firstName =
      user.firstName?.trim() || '';

    const lastName =
      user.lastName?.trim() || '';

    const firstInitial =
      firstName.charAt(0);

    const lastInitial =
      lastName.charAt(0);

    const initials =
      `${firstInitial}${lastInitial}`
        .toUpperCase();

    return initials || 'ES';
  }


  getAvatarClass(
    index: number
  ): string {
    const variants = [
      'student-result__avatar--purple',
      'student-result__avatar--blue',
      'student-result__avatar--green',
      'student-result__avatar--orange'
    ];

    return variants[
      index % variants.length
    ];
  }


  trackByUserId(
    index: number,
    user: UserDto
  ): number {
    return user.id;
  }

}