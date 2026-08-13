import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  Subject,
  Subscription,
} from 'rxjs';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

import {
  UsersService,
} from '../../../services/users.service';


@Component({
  selector: 'app-report-progress-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './report-progress-filters.component.html',
  styleUrl: './report-progress-filters.component.scss',
})
export class ReportProgressFiltersComponent implements OnDestroy {

  /* =========================
     INPUTS
  ========================= */

  @Input() stages: Stage[] = [];


  /* =========================
     OUTPUT
  ========================= */

  @Output() filtersSubmitted =
    new EventEmitter<{
      studentId: number;
      studentStage?: string;
      from?: string;
      to?: string;
    }>();


  /* =========================
     STUDENT SEARCH
  ========================= */

  searchTerm: string = '';

  filteredUsers: UserDto[] = [];

  selectedStudent: UserDto | null = null;

  showStudentDropdown: boolean = false;

  isSearchingStudents: boolean = false;

  private searchInput$ =
    new Subject<string>();

  private searchSubscription:
    Subscription;


  /* =========================
     STAGE
  ========================= */

  selectedStage: Stage | null = null;

  showStageDropdown: boolean = false;


  /* =========================
     DATES
  ========================= */

  fromDate: string = '';

  toDate: string = '';


  constructor(
    private usersService: UsersService,
  ) {

    this.searchSubscription =
      this.searchInput$
        .pipe(
          debounceTime(300),
        )
        .subscribe(
          term =>
            this.filterUsers(term),
        );
  }


  /* =========================
     DESTROY
  ========================= */

  ngOnDestroy(): void {

    this.searchSubscription.unsubscribe();

    this.searchInput$.complete();
  }


  /* =========================
     STUDENT
  ========================= */

  onSearchChange(
    term: string,
  ): void {

    if (this.selectedStudent) {
      this.selectedStudent = null;
    }

    this.searchInput$.next(term);
  }


  filterUsers(
    term: string,
  ): void {

    const normalizedTerm =
      term.trim();

    if (
      normalizedTerm.length < 2
    ) {

      this.filteredUsers = [];

      this.showStudentDropdown =
        false;

      this.isSearchingStudents =
        false;

      return;
    }


    this.isSearchingStudents =
      true;


    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        normalizedTerm,
        normalizedTerm,
        undefined,
      )
      .subscribe({

        next: result => {

          this.filteredUsers =
            result.users.filter(
              user =>
                !!user.student,
            );

          this.showStudentDropdown =
            true;

          this.isSearchingStudents =
            false;

        },


        error: () => {

          this.filteredUsers = [];

          this.showStudentDropdown =
            false;

          this.isSearchingStudents =
            false;

        },

      });
  }


  selectStudent(
    user: UserDto,
  ): void {

    if (!user.student) {
      return;
    }

    this.selectedStudent = user;

    this.searchTerm =
      `${user.firstName ?? ''} ${user.lastName ?? ''}`
        .trim();

    this.filteredUsers = [];

    this.showStudentDropdown = false;


    /*
     * Como el stage del estudiante
     * ya viene en el UserDto, lo dejamos
     * seleccionado por defecto.
     */
    const studentStageId =
      user.student.stageId;


    const matchingStage =
      this.stages.find(
        stage =>
          stage.id ===
          studentStageId,
      );


    this.selectedStage =
      matchingStage ?? null;
  }


  clearSelectedStudent(): void {

    this.selectedStudent = null;

    this.searchTerm = '';

    this.filteredUsers = [];

    this.showStudentDropdown = false;

    this.selectedStage = null;
  }


  hideStudentDropdown(): void {

    setTimeout(() => {

      this.showStudentDropdown =
        false;

    }, 200);
  }


  get selectedStudentName(): string {

    if (!this.selectedStudent) {
      return '';
    }

    const firstName =
      this.selectedStudent.firstName ??
      '';

    const lastName =
      this.selectedStudent.lastName ??
      '';

    return `${firstName} ${lastName}`
      .trim();
  }


  get selectedStudentInitials(): string {

    if (!this.selectedStudent) {
      return 'ES';
    }

    const firstName =
      this.selectedStudent.firstName
        ?.trim()
        ?.charAt(0) ?? '';

    const lastName =
      this.selectedStudent.lastName
        ?.trim()
        ?.charAt(0) ?? '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'ES'
    );
  }


  /* =========================
     STAGE
  ========================= */

  toggleStageDropdown(): void {

    if (
      !this.selectedStudent
    ) {
      return;
    }

    this.showStageDropdown =
      !this.showStageDropdown;

    this.showStudentDropdown =
      false;
  }


  selectStage(
    stage: Stage,
  ): void {

    this.selectedStage =
      stage;

    this.showStageDropdown =
      false;
  }


  clearSelectedStage(): void {

    this.selectedStage =
      null;

    this.showStageDropdown =
      false;
  }


  get selectedStageLabel(): string {

    if (!this.selectedStage) {
      return 'Selecciona un stage';
    }

    const number =
      this.selectedStage.number ??
      '';

    const description =
      this.selectedStage.description ??
      '';

    if (
      number &&
      description
    ) {

      return (
        `Stage ${number} - ${description}`
      );
    }

    if (number) {
      return `Stage ${number}`;
    }

    return (
      description ||
      'Stage seleccionado'
    );
  }


  /* =========================
     DATES
  ========================= */

  onFromDateChange(
    value: string,
  ): void {

    this.fromDate = value;

    if (
      this.toDate &&
      this.fromDate &&
      this.toDate < this.fromDate
    ) {

      this.toDate = '';
    }
  }


  onToDateChange(
    value: string,
  ): void {

    this.toDate = value;
  }


  get minToDate(): string | null {

    return (
      this.fromDate ||
      null
    );
  }


  /* =========================
     VALIDATION
  ========================= */

  get canSubmit(): boolean {

    return !!(
      this.selectedStudent
        ?.student
        ?.id
    );
  }


  /* =========================
     SUBMIT
  ========================= */

  submitFilters(): void {

    const studentId =
      this.selectedStudent
        ?.student
        ?.id;


    if (!studentId) {
      return;
    }


    this.filtersSubmitted.emit({

      studentId,

      ...(this.selectedStage
        ?.description
        ? {
            studentStage:
              this.selectedStage
                .description,
          }
        : {}),

      ...(this.fromDate
        ? {
            from:
              this.fromDate,
          }
        : {}),

      ...(this.toDate
        ? {
            to:
              this.toDate,
          }
        : {}),

    });
  }


  /* =========================
     RESET
  ========================= */

  resetFilters(): void {
    this.searchTerm = '';
    this.filteredUsers = [];
    this.selectedStudent = null;
    this.selectedStage = null;
    this.fromDate = '';
    this.toDate = '';
    this.showStudentDropdown = false;
    this.showStageDropdown = false;
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByUserId(
    index: number,
    user: UserDto,
  ): number {

    return user.id;
  }


  trackByStageId(
    index: number,
    stage: Stage,
  ): number {

    return stage.id;
  }

}