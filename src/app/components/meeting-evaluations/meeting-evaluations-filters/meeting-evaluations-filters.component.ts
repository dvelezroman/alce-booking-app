import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

export interface MeetingEvaluationFilters {
  instructorId?: number;
  studentId?: number;
  from?: string;
  to?: string;
}

@Component({
  selector: 'app-meeting-evaluations-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-evaluations-filters.component.html',
  styleUrl: './meeting-evaluations-filters.component.scss'
})
export class MeetingEvaluationsFiltersComponent implements OnInit {

  @Output() filtersSubmitted = new EventEmitter<MeetingEvaluationFilters>();

  // --------------------
  // INPUT MODELS
  // --------------------
  instructorSearch = '';
  studentSearch = '';

  fromDate?: string;
  toDate?: string;

  // --------------------
  // DROPDOWNS DATA
  // --------------------
  filteredInstructors: UserDto[] = [];
  filteredStudents: UserDto[] = [];

  showInstructorDropdown = false;
  showStudentDropdown = false;

  selectedInstructor?: UserDto;
  selectedStudent?: UserDto;

  instructorInput$ = new Subject<string>();
  studentInput$ = new Subject<string>();

  constructor(private usersService: UsersService) {
    this.instructorInput$
      .pipe(debounceTime(300))
      .subscribe(term => this.searchInstructors(term));

    this.studentInput$
      .pipe(debounceTime(300))
      .subscribe(term => this.searchStudents(term));
  }

  ngOnInit(): void {
    const today = new Date();

    // FECHA HASTA = HOY
    this.toDate = today.toISOString().split('T')[0];

    // FECHA DESDE = HOY - 7 DÍAS
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 7);
    this.fromDate = fromDate.toISOString().split('T')[0];
  }

  // --------------------
  // INPUT EVENTS
  // --------------------
  onInstructorChange(term: string) {
    this.instructorInput$.next(term);
  }

  onStudentChange(term: string) {
    this.studentInput$.next(term);
  }

  // --------------------
  // SEARCH USERS
  // --------------------
  private searchInstructors(term: string) {
    const query = term.trim();
    if (query.length < 2) {
      this.filteredInstructors = [];
      this.showInstructorDropdown = false;
      return;
    }

    this.usersService
      .searchUsers(0, 20, undefined, query, query, undefined, UserRole.INSTRUCTOR)
      .subscribe({
        next: res => {
          this.filteredInstructors = res.users;
          this.showInstructorDropdown = true;
        },
        error: () => {
          this.filteredInstructors = [];
          this.showInstructorDropdown = false;
        }
      });
  }

  private searchStudents(term: string) {
    const query = term.trim();
    if (query.length < 2) {
      this.filteredStudents = [];
      this.showStudentDropdown = false;
      return;
    }

    this.usersService
      .searchUsers(0, 20, undefined, query, query, undefined, UserRole.STUDENT)
      .subscribe({
        next: res => {
          this.filteredStudents = res.users;
          this.showStudentDropdown = true;
        },
        error: () => {
          this.filteredStudents = [];
          this.showStudentDropdown = false;
        }
      });
  }

  // --------------------
  // SELECT USERS (CLAVE)
  // --------------------
  selectInstructor(user: UserDto) {
    this.selectedInstructor = user;
    this.instructorSearch = `${user.firstName} ${user.lastName}`;
    this.filteredInstructors = [];
    this.showInstructorDropdown = false;

    // LIMPIAR ESTUDIANTE SI EXISTÍA
    if (this.selectedStudent) {
      this.selectedStudent = undefined;
      this.studentSearch = '';
      this.filteredStudents = [];
      this.showStudentDropdown = false;
    }
  }

  selectStudent(user: UserDto) {
    this.selectedStudent = user;
    this.studentSearch = `${user.firstName} ${user.lastName}`;
    this.filteredStudents = [];
    this.showStudentDropdown = false;

    // LIMPIAR INSTRUCTOR SI EXISTÍA
    if (this.selectedInstructor) {
      this.selectedInstructor = undefined;
      this.instructorSearch = '';
      this.filteredInstructors = [];
      this.showInstructorDropdown = false;
    }
  }

  hideInstructorDropdown() {
    setTimeout(() => (this.showInstructorDropdown = false), 200);
  }

  hideStudentDropdown() {
    setTimeout(() => (this.showStudentDropdown = false), 200);
  }

  // --------------------
  // SUBMIT
  // --------------------
  applyFilters() {
    const { from, to } = this.getDefaultDateRange();

    this.filtersSubmitted.emit({
      instructorId: this.selectedInstructor?.instructor?.id,
      studentId: this.selectedStudent?.student?.id,
      from: this.fromDate || from,
      to: this.toDate || to
    });
  }

  resetFilters() {
    this.instructorSearch = '';
    this.studentSearch = '';
    this.selectedInstructor = undefined;
    this.selectedStudent = undefined;
    this.filteredInstructors = [];
    this.filteredStudents = [];
    this.showInstructorDropdown = false;
    this.showStudentDropdown = false;
  }

  private getDefaultDateRange(): { from: string; to: string } {
    const today = new Date();

    const to = today.toISOString().split('T')[0];

    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 7);
    const from = fromDate.toISOString().split('T')[0];

    return { from, to };
  }
}