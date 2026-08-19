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
  selector: 'app-report-user-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-user-detail-panel.component.html',
  styleUrl: './report-user-detail-panel.component.scss',
})
export class ReportUserDetailPanelComponent {

  @Input() user: UserDto | null = null;

  @Output() closeRequested =
    new EventEmitter<void>();

  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.closeRequested.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  /* =========================
     USER
  ========================= */

  get fullName(): string {
    if (!this.user) {
      return 'Sin usuario';
    }

    return [
      this.user.firstName,
      this.user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Sin nombre';
  }

  get initials(): string {
    if (!this.user) {
      return 'US';
    }

    const first =
      this.user.firstName
        ?.trim()
        ?.charAt(0) || '';

    const last =
      this.user.lastName
        ?.trim()
        ?.charAt(0) || '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'US'
    );
  }

  get email(): string {
    if (!this.user) {
      return '—';
    }

    return (
      this.user.emailAddress ||
      this.user.email ||
      '—'
    );
  }

  get identification(): string {
    if (!this.user) {
      return '—';
    }

    return (
      this.user.idNumber ||
      String(this.user.id) ||
      '—'
    );
  }

  get phone(): string {
    if (!this.user) {
      return '—';
    }

    const value =
      this.user as UserDto & {
        phone?: string;
        phoneNumber?: string;
        cellphone?: string;
        mobile?: string;
      };

    return (
      value.phoneNumber ||
      value.phone ||
      value.cellphone ||
      value.mobile ||
      '—'
    );
  }

  get city(): string {
    if (!this.user) {
      return '—';
    }

    const value =
      this.user as UserDto & {
        city?: string;
        location?: string;
        address?: {
          city?: string;
        };
      };

    return (
      value.city ||
      value.address?.city ||
      value.location ||
      '—'
    );
  }

  /* =========================
     ROLE
  ========================= */

  get roleLabel(): string {
    switch (this.user?.role) {
      case UserRole.STUDENT:
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
        return 'Instructor';

      case UserRole.ADMIN:
        return 'Administrador';

      default:
        return this.user?.role
          ? String(this.user.role)
          : 'Sin rol';
    }
  }

  get roleModifier():
    | 'student'
    | 'instructor'
    | 'admin'
    | 'other' {

    switch (this.user?.role) {
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

  get statusLabel(): string {
    switch (this.user?.status) {
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

  get statusModifier():
    | 'active'
    | 'inactive'
    | 'hold'
    | 'block' {

    switch (this.user?.status) {
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
     STUDENT
  ========================= */

  get isStudent(): boolean {
    return !!this.user?.student;
  }

  get studentId(): string {
    return this.user?.student?.id
      ? String(this.user.student.id)
      : '—';
  }

  get stageLabel(): string {
    const stage =
      this.user?.student?.stage;

    if (!stage) {
      return '—';
    }

    if (stage.number) {
      return `STG ${stage.number}`;
    }

    return stage.description ||
      '—';
  }

  get stageDescription(): string {
    return (
      this.user?.student
        ?.stage
        ?.description ||
      '—'
    );
  }

  /* =========================
     ACTIVITY
  ========================= */

  get commentsCount(): number {
    if (!this.user) {
      return 0;
    }

    const value =
      this.user as UserDto & {
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

  get alertsCount(): number {
    if (!this.user) {
      return 0;
    }

    const value =
      this.user as UserDto & {
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
     DATES
  ========================= */

  get createdAt(): string {
    if (!this.user) {
      return '—';
    }

    const value =
      this.user as UserDto & {
        createdAt?: string | Date;
      };

    return this.formatDateTime(
      value.createdAt
    );
  }

  get studentCreatedAt(): string {
    return this.formatDateTime(
      this.user?.student?.createdAt
    );
  }

  /* =========================
     HELPERS
  ========================= */

  private formatDateTime(
    value?: string | Date | null,
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

    return date.toLocaleString(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }
}