import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  UserDto,
  UserRole,
  UserStatus,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-searching-user-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './searching-user-table.component.html',
  styleUrl: './searching-user-table.component.scss',
})
export class SearchingUserTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() users: UserDto[] = [];
  @Input() totalUsers = 0;
  @Input() currentPage = 1;
  @Input() itemsPerPage = 100;
  @Input() showStageColumn = true;
  @Input() noResults = false;

  selectedUser: UserDto | null = null;


  /* =========================
     OUTPUTS
  ========================= */
  @Output() editRequested = new EventEmitter<UserDto>();
  @Output() passwordRequested = new EventEmitter<UserDto>();
  @Output() contactRequested = new EventEmitter<UserDto>();
  @Output() deleteRequested = new EventEmitter<UserDto>();
  @Output() removeSuspensionRequested = new EventEmitter<UserDto>();   

  openMenuUserId: number | null = null;


  /* =========================
     TABLE
  ========================= */

  trackByUserId(
    index: number,
    user: UserDto,
  ): number {
    return user.id;
  }


  getSuspensionLabel(user: UserDto): string {
    if (!this.isStudent(user)) {
      return '—';
    }

    return this.hasActiveSuspension(user)
      ? 'Suspendido'
      : 'Sin suspensión';
  }

  getSuspensionClass(user: UserDto): string {
    if (!this.isStudent(user)) {
      return '';
    }

    return this.hasActiveSuspension(user)
      ? 'searching-user-table__suspension--active'
      : 'searching-user-table__suspension--none';
  }

  /* =========================
     USER
  ========================= */

  getUserFullName(user: UserDto): string {
    const fullName = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || 'Sin nombre';
  }

  getUserInitials(user: UserDto): string {
    const firstName =
      user.firstName?.trim()?.charAt(0) || '';

    const lastName =
      user.lastName?.trim()?.charAt(0) || '';

    return `${firstName}${lastName}`.toUpperCase() || 'U';
  }

  getUserEmail(user: UserDto): string {
    return user.email || user.emailAddress || '—';
  }


  /* =========================
     ROLE
  ========================= */

  getRoleLabel(role?: UserRole | string): string {
    switch (role) {
      case UserRole.STUDENT:
      case 'STUDENT':
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
      case 'INSTRUCTOR':
        return 'Instructor';

      case UserRole.ADMIN:
      case 'ADMIN':
        return 'Admin';

      default:
        return role || '—';
    }
  }

  getRoleClass(role?: UserRole | string): string {
    switch (role) {
      case UserRole.STUDENT:
      case 'STUDENT':
        return 'searching-user-table__role--student';

      case UserRole.INSTRUCTOR:
      case 'INSTRUCTOR':
        return 'searching-user-table__role--instructor';

      case UserRole.ADMIN:
      case 'ADMIN':
        return 'searching-user-table__role--admin';

      default:
        return '';
    }
  }


  /* =========================
     STATUS
  ========================= */

  getStatusLabel(status?: UserStatus | string): string {
    switch (status) {
      case UserStatus.ACTIVE:
      case 'ACTIVE':
        return 'Activo';

      case UserStatus.INACTIVE:
      case 'INACTIVE':
        return 'Inactivo';

      case 'SUSPENDED':
        return 'Suspendido';

      default:
        return status || '—';
    }
  }

  getStatusClass(status?: UserStatus | string): string {
    switch (status) {
      case UserStatus.ACTIVE:
      case 'ACTIVE':
        return 'searching-user-table__status--active';

      case UserStatus.INACTIVE:
      case 'INACTIVE':
        return 'searching-user-table__status--inactive';

      case 'SUSPENDED':
        return 'searching-user-table__status--suspended';

      default:
        return '';
    }
  }


  /* =========================
     STUDENT
  ========================= */

  isStudent(user: UserDto): boolean {
    return user.role === UserRole.STUDENT;
  }

  getStage(user: UserDto): string {
    if (!this.isStudent(user)) {
      return '—';
    }

    return user.student?.stage?.number
      ? `Stage ${user.student.stage.number}`
      : '—';
  }

  getCategory(user: UserDto): string {
    if (!this.isStudent(user)) {
      return '';
    }

    return user.student?.studentClassification || '';
  }

  getProgress(user: UserDto): number {
    return user.currentStageProgress ?? 0;
  }


  /* =========================
     DATES
  ========================= */

  getStartClassDate(user: UserDto): string {
    return this.formatDate(
      user.student?.startClassDate,
    );
  }

  getEndClassDate(user: UserDto): string {
    return this.formatDate(
      user.student?.endClassDate,
    );
  }

  getCreatedAt(user: UserDto): string {
    return this.formatDate(user.createdAt);
  }

  private formatDate(
    value?: string | Date | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(date);
  }


  /* =========================
     RESULTS
  ========================= */

  get resultsStart(): number {
    if (
      this.totalUsers === 0 ||
      this.users.length === 0
    ) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.itemsPerPage
    ) + 1;
  }

  get resultsEnd(): number {
    if (this.totalUsers === 0) {
      return 0;
    }

    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.totalUsers,
    );
  }
 

  toggleActionsMenu(userId: number): void {
    this.openMenuUserId =
      this.openMenuUserId === userId
        ? null
        : userId;
  }

  isActionsMenuOpen(userId: number): boolean {
    return this.openMenuUserId === userId;
  }

  closeActionsMenu(): void {
    this.openMenuUserId = null;
  }

 /* =========================
   ACTIONS
========================= */

  onEdit(user: UserDto): void {
    this.closeActionsMenu();
    this.editRequested.emit(user);
  }

  onPassword(user: UserDto): void {
    this.closeActionsMenu();
    this.passwordRequested.emit(user);
  }

  onContact(user: UserDto): void {
    this.closeActionsMenu();
    this.contactRequested.emit(user);
  }

  onDelete(user: UserDto): void {
    this.closeActionsMenu();
    this.deleteRequested.emit(user);
  }

 onRemoveSuspension(user: UserDto): void {
  console.log('[TABLA] Usuario seleccionado:', user);
  console.log('[TABLA] Student:', user.student);
  console.log('[TABLA] Student ID:', user.student?.id);

  this.closeActionsMenu();

  console.log('[TABLA] Emitiendo UserDto al padre...');
  this.removeSuspensionRequested.emit(user);
}


   /* =========================
   HELPER
  ========================= */

  hasActiveSuspension(user: UserDto): boolean {
    if (!this.isStudent(user)) {
      return false;
    }

    return !!(
      user.student?.suspensionDays &&
      user.student?.suspensionStartDate &&
      user.student?.suspensionEndDate
    );
  }

  /* =========================
     ENUMS
  ========================= */

  protected readonly UserRole = UserRole;

  protected readonly UserStatus = UserStatus;
}