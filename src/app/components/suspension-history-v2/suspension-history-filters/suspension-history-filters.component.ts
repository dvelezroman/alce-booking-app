import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-suspension-history-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './suspension-history-filters.component.html',
  styleUrl: './suspension-history-filters.component.scss',
})
export class SuspensionHistoryFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() filteredStudents: UserDto[] = [];

  @Input() showStudentDropdown = false;

  @Input() isStudentFieldInvalid = false;

  @Input() selectedStudentId: number | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() studentInputChange =
    new EventEmitter<string>();

  @Output() studentSelected =
    new EventEmitter<UserDto>();

  @Output() studentDropdownHidden =
    new EventEmitter<void>();

  @Output() filtersChange =
    new EventEmitter<{
      studentId?: number;
      stageId?: number;
    }>();


  /* =========================
     FILTER STATE
  ========================= */

  studentSearch = '';

  studentId: number | null = null;

  stageId: number | null = null;


  /* =========================
     STUDENT SEARCH
  ========================= */

  onStudentInputChange(
    term: string,
  ): void {
    this.studentSearch = term;

    /*
     * Si el usuario escribe nuevamente,
     * quitamos el estudiante previamente
     * seleccionado.
     */
    this.studentId = null;

    this.studentInputChange.emit(
      term,
    );
  }


  onSelectStudent(
    user: UserDto,
  ): void {
    this.studentSearch =
      this.getStudentFullName(
        user,
      );

    this.studentId =
      this.getStudentId(
        user,
      );

    this.studentSelected.emit(
      user,
    );
  }


  onStudentInputBlur(): void {
    setTimeout(() => {
      this.studentDropdownHidden.emit();
    }, 150);
  }


  clearStudent(): void {
    this.studentId = null;
    this.studentSearch = '';

    this.studentInputChange.emit(
      '',
    );
  }


  /* =========================
     SEARCH
  ========================= */

  search(): void {
    this.filtersChange.emit({
      studentId:
        this.studentId ??
        undefined,

      stageId:
        this.stageId ??
        undefined,
    });
  }


  /* =========================
     CLEAR FILTERS
  ========================= */

  clearFilters(): void {
    this.studentId = null;
    this.studentSearch = '';
    this.stageId = null;

    this.studentInputChange.emit(
      '',
    );

    this.filtersChange.emit({});
  }


  /* =========================
     STUDENT HELPERS
  ========================= */

  getStudentFullName(
    user: UserDto,
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


  getStudentInitials(
    user: UserDto,
  ): string {
    const first =
      user.firstName
        ?.trim()
        .charAt(0) || '';

    const last =
      user.lastName
        ?.trim()
        .charAt(0) || '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'E'
    );
  }


  getStudentIdentification(
    user: UserDto,
  ): string {
    return (
      user.idNumber ||
      String(user.id)
    );
  }


  private getStudentId(
    user: UserDto,
  ): number {
    if (
      user.student?.id
    ) {
      return Number(
        user.student.id,
      );
    }

    return Number(
      user.id,
    );
  }
}