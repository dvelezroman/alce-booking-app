import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  UserDto,
  UserRole,
  UserStatus,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-report-user-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-user-table.component.html',
  styleUrl: './report-user-table.component.scss',
})
export class ReportUserTableComponent {

  @Input() users: UserDto[] = [];
  @Input() loading = false;
  @Input() startIndex = 1;

  @Output() userSelected =
    new EventEmitter<UserDto>();

  @Output() stageRequested =
    new EventEmitter<number>();

  openMenuId:
    number | null = null;


  /* =========================
     MENU
  ========================= */

  toggleMenu(
    event: MouseEvent,
    userId: number,
  ): void {
    event.stopPropagation();

    this.openMenuId =
      this.openMenuId === userId
        ? null
        : userId;
  }

  isMenuOpen(
    userId: number,
  ): boolean {
    return this.openMenuId === userId;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }


  /* =========================
     ACTIONS
  ========================= */

  onView(
    event: MouseEvent,
    user: UserDto,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.userSelected.emit(
      user,
    );
  }

  onStage(
    event: MouseEvent,
    user: UserDto,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    if (!user.student?.id) {
      return;
    }

    this.stageRequested.emit(
      user.student.id,
    );
  }


  /* =========================
     USER
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
    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) ||
      '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) ||
      '';

    return (
      `${firstName}${lastName}`
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


  /* =========================
     ROLE
  ========================= */

  getRoleLabel(
    role?: UserRole,
  ): string {
    switch (role) {
      case UserRole.STUDENT:
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
        return 'Instructor';

      case UserRole.ADMIN:
        return 'Administrador';

      default:
        return role
          ? String(role)
          : 'Sin rol';
    }
  }

  getRoleModifier(
    role?: UserRole,
  ):
    | 'student'
    | 'instructor'
    | 'admin'
    | 'other' {

    switch (role) {
      case UserRole.STUDENT:
        return 'student';

      case UserRole.INSTRUCTOR:
        return 'instructor';

      case UserRole.ADMIN:
        return 'admin';

      default:
        return 'other';
    }
  }


  /* =========================
     STATUS
  ========================= */

  getStatusLabel(
    status?: UserStatus,
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
        return 'Sin estado';
    }
  }

  getStatusModifier(
    status?: UserStatus,
  ):
    | 'active'
    | 'inactive'
    | 'hold'
    | 'block' {

    switch (status) {
      case UserStatus.ACTIVE:
        return 'active';

      case UserStatus.HOLD:
        return 'hold';

      case UserStatus.BLOCK:
        return 'block';

      default:
        return 'inactive';
    }
  }


  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    user: UserDto,
  ): string {
    const stage =
      user.student?.stage;

    if (!stage) {
      return '—';
    }

    if (stage.number) {
      return `Stage ${stage.number}`;
    }

    return stage.description ||
      'Sin stage';
  }

  hasStage(
    user: UserDto,
  ): boolean {
    return !!(
      user.student?.id &&
      user.student?.stage
    );
  }


  /* =========================
     COMMENTS
  ========================= */

  getCommentsCount(
    user: UserDto,
  ): number {
    const value =
      user as UserDto & {
        commentsCount?: number;
        commentCount?: number;
        comments?: unknown[];
      };

    return Number(
      value.commentsCount ??
      value.commentCount ??
      value.comments?.length ??
      0
    );
  }


  /* =========================
     ALERTS
  ========================= */

  getAlertsCount(
    user: UserDto,
  ): number {
    const value =
      user as UserDto & {
        alertsCount?: number;
        alertCount?: number;
        alerts?: unknown[];
      };

    return Number(
      value.alertsCount ??
      value.alertCount ??
      value.alerts?.length ??
      0
    );
  }


  /* =========================
     CREATED
  ========================= */

  getCreatedAt(
    user: UserDto,
  ): string | Date | null {
    const value =
      user as UserDto & {
        createdAt?: string | Date;
      };

    return value.createdAt ?? null;
  }

  formatDate(
    value: string | Date | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—';
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByUserId(
    index: number,
    user: UserDto,
  ): number {
    return user.id ?? index;
  }
}