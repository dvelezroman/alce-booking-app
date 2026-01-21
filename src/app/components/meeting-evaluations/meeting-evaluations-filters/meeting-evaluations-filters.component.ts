import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';

import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { EvaluationStatisticsFilterDto, FilterEvaluationsDto } from '../../../services/dtos/instructor-evaluation.dto';

export type EvaluationFilterMode = 'evaluations' | 'statistics';

@Component({
  selector: 'app-meeting-evaluations-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meeting-evaluations-filters.component.html',
  styleUrl: './meeting-evaluations-filters.component.scss'
})
export class MeetingEvaluationsFiltersComponent implements OnInit {

  // 🔹 MODO DEL FILTRO
  @Input() mode: EvaluationFilterMode = 'evaluations';

  @Output() filtersSubmitted = new EventEmitter<FilterEvaluationsDto | EvaluationStatisticsFilterDto>();

  // --------------------
  // INPUT MODELS
  // --------------------
  instructorSearch = '';
  studentSearch = '';

  fromDate?: string;
  toDate?: string;

  // SOLO STATISTICS
  minAverageRating?: number;
  ratingOptions = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

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
    this.setDefaultDates();
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
  // SELECT USERS
  // --------------------
  selectInstructor(user: UserDto) {
    this.selectedInstructor = user;
    this.instructorSearch = `${user.firstName} ${user.lastName}`;
    this.filteredInstructors = [];
    this.showInstructorDropdown = false;

    if (this.mode === 'evaluations') {
      this.clearStudent();
    }
  }

  selectStudent(user: UserDto) {
    this.selectedStudent = user;
    this.studentSearch = `${user.firstName} ${user.lastName}`;
    this.filteredStudents = [];
    this.showStudentDropdown = false;

    this.clearInstructor();
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

    // -------- EVALUATIONS --------
    if (this.mode === 'evaluations') {
      const filters: FilterEvaluationsDto = {
        instructorId: this.selectedInstructor?.instructor?.id,
        studentId: this.selectedStudent?.student?.id,
        from: this.fromDate,
        to: this.toDate
      };

      this.filtersSubmitted.emit(filters);
      return;
    }

    // -------- STATISTICS --------
    if (this.mode === 'statistics') {
      const filters: EvaluationStatisticsFilterDto = {
        instructorId: this.selectedInstructor?.instructor?.id,
        from: this.fromDate,
        to: this.toDate,
        minAverageRating: this.minAverageRating
      };

      this.filtersSubmitted.emit(filters);
      return;
    }
  }

  resetFilters() {
    this.clearInstructor();
    this.clearStudent();
    this.minAverageRating = undefined;
    this.setDefaultDates();
  }

  // --------------------
  // HELPERS
  // --------------------
  private clearInstructor() {
    this.selectedInstructor = undefined;
    this.instructorSearch = '';
    this.filteredInstructors = [];
    this.showInstructorDropdown = false;
  }

  private clearStudent() {
    this.selectedStudent = undefined;
    this.studentSearch = '';
    this.filteredStudents = [];
    this.showStudentDropdown = false;
  }

  private setDefaultDates() {
    const today = new Date();
    this.toDate = today.toISOString().split('T')[0];

    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 20);
    this.fromDate = fromDate.toISOString().split('T')[0];
  }
}