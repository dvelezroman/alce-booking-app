import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  FilterEvaluationsDto
} from '../../../services/dtos/instructor-evaluation.dto';

import {
  UserDto
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-meeting-evaluations-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './meeting-evaluations-filters.component.html',
  styleUrl: './meeting-evaluations-filters.component.scss'
})
export class MeetingEvaluationsFiltersComponent implements OnInit {

  /* =========================
     INPUTS
  ========================= */

  @Input() sortBy: 'rating' | 'createdAt' = 'createdAt';

  @Input() sortOrder: 'asc' | 'desc' = 'desc';

  @Input() filteredStudents: UserDto[] = [];

  @Input() filteredInstructors: UserDto[] = [];

  @Input() showStudentDropdown = false;

  @Input() showInstructorDropdown = false;

  @Input() isStudentFieldInvalid = false;

  @Input() isInstructorFieldInvalid = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() filtersSubmitted =
    new EventEmitter<FilterEvaluationsDto>();

  @Output() sortRequested =
    new EventEmitter<'rating' | 'createdAt'>();

  @Output() studentInputChange =
    new EventEmitter<string>();

  @Output() studentSelected =
    new EventEmitter<UserDto>();

  @Output() studentDropdownHidden =
    new EventEmitter<void>();

  @Output() instructorInputChange =
    new EventEmitter<string>();

  @Output() instructorSelected =
    new EventEmitter<UserDto>();

  @Output() instructorDropdownHidden =
    new EventEmitter<void>();


  /* =========================
     SEARCH STATE
  ========================= */

  studentSearch = '';

  instructorSearch = '';

  selectedStudentId: number | null = null;

  selectedInstructorId: number | null = null;


  /* =========================
     FILTER STATE
  ========================= */

  from = '';

  to = '';

  accepted:
    'all' |
    'accepted' |
    'rejected' = 'all';


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {

    const {
      from,
      to
    } = this.getDefaultDateRange();

    this.from = from;
    this.to = to;
  }


  /* =========================
     DEFAULT DATE RANGE
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
     STUDENT SEARCH
  ========================= */

  onStudentInputChange(
    term: string
  ): void {

    this.studentSearch = term;

    /*
     * Si modifica manualmente el texto
     * después de seleccionar un usuario,
     * limpiamos el id seleccionado.
     */
    this.selectedStudentId = null;

    this.studentInputChange.emit(
      term
    );
  }


  onSelectStudent(
    user: UserDto
  ): void {

    this.studentSearch =
      this.getStudentFullName(user);

    this.selectedStudentId =
      this.getStudentIdValue(user);

    this.studentSelected.emit(
      user
    );
  }


  onStudentInputBlur(): void {

    /*
     * El pequeño delay permite hacer click
     * en un elemento del dropdown antes
     * de que se oculte.
     */
    setTimeout(() => {
      this.studentDropdownHidden.emit();
    }, 150);
  }


  /* =========================
     INSTRUCTOR SEARCH
  ========================= */

  onInstructorInputChange(
    term: string
  ): void {

    this.instructorSearch = term;

    this.selectedInstructorId = null;

    this.instructorInputChange.emit(
      term
    );
  }


  onSelectInstructor(
    user: UserDto
  ): void {

    this.instructorSearch =
      this.getInstructorFullName(user);

    this.selectedInstructorId =
      this.getInstructorIdValue(user);

    this.instructorSelected.emit(
      user
    );
  }


  onInstructorInputBlur(): void {

    setTimeout(() => {
      this.instructorDropdownHidden.emit();
    }, 150);
  }


  /* =========================
     SEARCH
  ========================= */

  onSearch(): void {

    const filters:
      FilterEvaluationsDto = {

      from:
        this.from,

      to:
        this.to,

      limit: 100,

      offset: 0,

      sortBy:
        this.sortBy,

      sortOrder:
        this.sortOrder
    };


    if (
      this.selectedStudentId !== null
    ) {
      filters.studentId =
        this.selectedStudentId;
    }


    if (
      this.selectedInstructorId !== null
    ) {
      filters.instructorId =
        this.selectedInstructorId;
    }


    if (
      this.accepted === 'accepted'
    ) {
      filters.accepted = true;
    }


    if (
      this.accepted === 'rejected'
    ) {
      filters.accepted = false;
    }


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
    } = this.getDefaultDateRange();


    this.studentSearch = '';

    this.instructorSearch = '';

    this.selectedStudentId = null;

    this.selectedInstructorId = null;

    this.from = from;

    this.to = to;

    this.accepted = 'all';

    this.sortBy = 'createdAt';

    this.sortOrder = 'desc';


    this.studentInputChange.emit('');

    this.instructorInputChange.emit('');


    this.filtersSubmitted.emit({
      from,
      to,
      limit: 100,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }


  /* =========================
     SORT
  ========================= */

  onSortFieldChange(
    value:
      'rating' |
      'createdAt'
  ): void {

    this.sortBy = value;

    this.sortRequested.emit(
      value
    );
  }


  onSortOrderChange(
    value:
      'asc' |
      'desc'
  ): void {

    this.sortOrder = value;

    this.sortRequested.emit(
      this.sortBy
    );
  }


  /* =========================
     STUDENT HELPERS
  ========================= */

  getStudentFullName(
    user: UserDto
  ): string {

    return [
      user.firstName,
      user.lastName
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Sin nombre';
  }


  getStudentInitials(
    user: UserDto
  ): string {

    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) || '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) || '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'E'
    );
  }


  getStudentIdentification(
    user: UserDto
  ): string {

    return (
      user.idNumber ||
      String(user.id)
    );
  }


  private getStudentIdValue(
    user: UserDto
  ): number {

    /*
     * Para evaluaciones necesitamos
     * studentId, no necesariamente user.id.
     */
    if (user.student?.id) {
      return Number(
        user.student.id
      );
    }

    return Number(
      user.id
    );
  }


  /* =========================
     INSTRUCTOR HELPERS
  ========================= */

  getInstructorFullName(
    user: UserDto
  ): string {

    return [
      user.firstName,
      user.lastName
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
        ?.charAt(0) || '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) || '';

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


  private getInstructorIdValue(
    user: UserDto
  ): number {

    return user.instructor?.id
      ? Number(
          user.instructor.id
        )
      : Number(
          user.id
        );
  }

}