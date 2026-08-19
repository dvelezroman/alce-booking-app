import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  Subject,
  takeUntil,
} from 'rxjs';

import {
  UserDto,
  UserRole,
  UserStatus,
} from '../../../services/dtos/user.dto';
import {
  Stage,
} from '../../../services/dtos/student.dto';

import { UsersService } from '../../../services/users.service';
import { StagesService } from '../../../services/stages.service';

export interface ReportUserFilters {
  userId?: number;
  userRole?: UserRole;
  userStatus?: UserStatus;
  stageId?: number;
  comment?: boolean;
  alert?: boolean;
  newStudents?: boolean;
}

@Component({
  selector: 'app-report-user-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './report-user-filters.component.html',
  styleUrl: './report-user-filters.component.scss',
})
export class ReportUserFiltersComponent implements OnInit, OnDestroy {

  @Output() filtersSubmitted =
    new EventEmitter<ReportUserFilters>();

  /* =========================
     USER SEARCH
  ========================= */

  userSearch = '';

  selectedUserId:
    number | undefined;

  filteredUsers: UserDto[] = [];

  showUserDropdown = false;

  isUserFieldInvalid = false;

  private userSearch$ =
    new Subject<string>();

  private destroy$ =
    new Subject<void>();

  /* =========================
     FILTERS
  ========================= */

  selectedRole:
    UserRole | '' = '';

  selectedStatus:
    UserStatus | '' = '';

  selectedStageId:
    number | null = null;

  onlyWithComments = false;

  onlyWithAlerts = false;

  onlyNewStudents = false;

  /* =========================
     OPTIONS
  ========================= */

  roles: UserRole[] = [];

  statuses: UserStatus[] = [];

  stages: Stage[] = [];

  isLoadingStages = false;

  constructor(
    private usersService: UsersService,
    private stagesService: StagesService,
  ) {
    this.userSearch$
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        this.fetchFilteredUsers(term);
      });
  }

  ngOnInit(): void {
    this.roles =
      Object.values(UserRole);

    this.statuses =
      Object.values(UserStatus);

    this.loadStages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* =========================
     USERS
  ========================= */

  onUserInputChange(
    term: string,
  ): void {
    this.userSearch = term;

    this.selectedUserId =
      undefined;

    this.isUserFieldInvalid =
      false;

    this.userSearch$.next(term);
  }

  private fetchFilteredUsers(
    term: string,
  ): void {
    const query =
      term
        .trim()
        .toLowerCase();

    if (query.length < 2) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      return;
    }

    this.usersService
      .searchUsers(
        0,
        20,
        undefined,
        query,
        query,
        undefined,
      )
      .subscribe({
        next: (response) => {
          this.filteredUsers =
            response.users ?? [];

          this.showUserDropdown =
            this.filteredUsers.length > 0;
        },
        error: () => {
          this.filteredUsers = [];
          this.showUserDropdown = false;
        },
      });
  }

  selectUser(
    user: UserDto,
  ): void {
    this.selectedUserId =
      user.id;

    this.userSearch =
      this.getUserFullName(user);

    this.filteredUsers = [];

    this.showUserDropdown =
      false;

    this.isUserFieldInvalid =
      false;
  }

  hideUserDropdown(): void {
    setTimeout(() => {
      this.showUserDropdown =
        false;
    }, 200);
  }

  /* =========================
     STAGES
  ========================= */

  private loadStages(): void {
    this.isLoadingStages = true;

    this.stagesService
      .getAll()
      .subscribe({
        next: (stages) => {
          this.stages =
            [...stages].sort(
              (a, b) =>
                Number(a.number ?? 0) -
                Number(b.number ?? 0),
            );

          this.isLoadingStages =
            false;
        },
        error: () => {
          this.stages = [];
          this.isLoadingStages =
            false;
        },
      });
  }

  /* =========================
     SEARCH
  ========================= */

  onSearch(): void {
    const filters:
      ReportUserFilters = {};

    if (this.selectedUserId) {
      filters.userId =
        this.selectedUserId;
    }

    if (this.selectedRole) {
      filters.userRole =
        this.selectedRole;
    }

    if (this.selectedStatus) {
      filters.userStatus =
        this.selectedStatus;
    }

    if (this.selectedStageId) {
      filters.stageId =
        Number(this.selectedStageId);
    }

    if (this.onlyWithComments) {
      filters.comment = true;
    }

    if (this.onlyWithAlerts) {
      filters.alert = true;
    }

    if (this.onlyNewStudents) {
      filters.newStudents = true;
    }

    this.filtersSubmitted.emit(
      filters,
    );
  }

  /* =========================
     CLEAR
  ========================= */

  onClear(): void {
    this.userSearch = '';

    this.selectedUserId =
      undefined;

    this.filteredUsers = [];

    this.showUserDropdown =
      false;

    this.isUserFieldInvalid =
      false;

    this.selectedRole = '';

    this.selectedStatus = '';

    this.selectedStageId =
      null;

    this.onlyWithComments =
      false;

    this.onlyWithAlerts =
      false;

    this.onlyNewStudents =
      false;

    this.filtersSubmitted.emit({});
  }

  /* =========================
     HELPERS
  ========================= */

  getUserFullName(
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

  getUserInitials(
    user: UserDto,
  ): string {
    const first =
      user.firstName
        ?.trim()
        .charAt(0) ?? '';

    const last =
      user.lastName
        ?.trim()
        .charAt(0) ?? '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'US'
    );
  }

  getUserEmail(
    user: UserDto,
  ): string {
    return (
      user.emailAddress ||
      user.email ||
      'Sin correo'
    );
  }

  getUserIdentifier(
    user: UserDto,
  ): string {
    return (
      user.idNumber ||
      String(user.id)
    );
  }

  getRoleLabel(
    role: UserRole,
  ): string {
    switch (role) {
      case UserRole.STUDENT:
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
        return 'Instructor';

      case UserRole.ADMIN:
        return 'Administrador';

      default:
        return String(role);
    }
  }

  getStatusLabel(
    status: UserStatus,
  ): string {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'Activo';

      case UserStatus.INACTIVE:
        return 'Inactivo';

      case UserStatus.HOLD:
        return 'En espera';

      case UserStatus.BLOCK:
        return 'Bloqueado';

      default:
        return String(status);
    }
  }

  getStageLabel(
    stage: Stage,
  ): string {
    return stage.number
      ? `Stage ${stage.number}`
      : `Stage ${stage.id}`;
  }
}