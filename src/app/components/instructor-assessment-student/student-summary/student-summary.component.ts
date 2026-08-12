import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';

import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-student-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './student-summary.component.html',
  styleUrl: './student-summary.component.scss',
})
export class StudentSummaryComponent implements OnDestroy {

  @Input() selectedStudent: UserDto | null = null;

  @Input() currentStageId: number | null = null;

  @Input() instructorId: number | null = null;

  @Output() studentSelected = new EventEmitter<{
    studentId: number;
    stageId: number;
    instructorId: number;
    user: UserDto;
  }>();


  /* =========================
     SEARCH
  ========================= */

  searchTerm: string = '';

  filteredUsers: UserDto[] = [];

  showUserDropdown: boolean = false;

  isSearchingStudent: boolean = false;

  searchInput$ = new Subject<string>();

  private searchSubscription: Subscription;


  constructor(
    private usersService: UsersService,
  ) {
    this.searchSubscription = this.searchInput$
      .pipe(
        debounceTime(300),
      )
      .subscribe((term: string) => {
        this.filterUsers(term);
      });
  }


  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.searchInput$.complete();
  }


  /* =========================
     STUDENT DATA
  ========================= */

  get studentFullName(): string {
    if (!this.selectedStudent) {
      return 'Selecciona un estudiante';
    }

    const firstName =
      this.selectedStudent.firstName ?? '';

    const lastName =
      this.selectedStudent.lastName ?? '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName || 'Estudiante';
  }


  get studentEmail(): string {
    return (
      this.selectedStudent?.email ??
      'Sin correo registrado'
    );
  }


  get studentInitials(): string {
    if (!this.selectedStudent) {
      return '--';
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
      `${firstName}${lastName}`.toUpperCase() ||
      '--'
    );
  }


  get studentId(): string | number {
    return (
      this.selectedStudent?.student?.id ??
      this.selectedStudent?.id ??
      '--'
    );
  }


  get currentStageLabel(): string {
    if (this.currentStageId == null) {
      return '--';
    }

    return `Stage ${this.currentStageId}`;
  }


  /* =========================
     SEARCH STUDENT
  ========================= */

  handleChangeStudent(): void {
    this.isSearchingStudent = true;

    this.searchTerm = '';

    this.filteredUsers = [];

    this.showUserDropdown = false;
  }


  cancelStudentSearch(): void {
    this.isSearchingStudent = false;

    this.searchTerm = '';

    this.filteredUsers = [];

    this.showUserDropdown = false;
  }


  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }


  filterUsers(term: string): void {
    const normalizedTerm = term.trim();

    if (normalizedTerm.length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;

      return;
    }

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

        next: (result) => {

          this.filteredUsers =
            result.users.filter(
              user => !!user.student,
            );

          this.showUserDropdown = true;

        },

        error: () => {

          this.filteredUsers = [];

          this.showUserDropdown = false;

        },

      });
  }


  selectUser(user: UserDto): void {
    const student = user.student;

    if (!student) {
      return;
    }

    if (!this.instructorId) {
      return;
    }

    this.searchTerm =
      `${user.firstName ?? ''} ${user.lastName ?? ''}`
        .trim();

    this.filteredUsers = [];

    this.showUserDropdown = false;

    this.isSearchingStudent = false;

    this.studentSelected.emit({
      studentId: student.id,
      stageId: student.stageId,
      instructorId: this.instructorId,
      user,
    });
  }


  hideDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 200);
  }


  trackByUserId(
    index: number,
    user: UserDto,
  ): number {
    return user.id;
  }

}