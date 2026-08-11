import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-profile-academic-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-academic-status.component.html',
  styleUrl:
    './profile-academic-status.component.scss',
})
export class ProfileAcademicStatusComponent {
  @Input() user: UserDto | null = null;

  get isStudent(): boolean {
    return (
      this.user?.role
        ?.toString()
        .trim()
        .toUpperCase() === 'STUDENT'
    );
  }

  get startClassDate(): string {
    if (!this.isStudent) {
      return 'No aplica';
    }

    return this.formatDate(
      this.user?.student?.startClassDate
    );
  }

  get endClassDate(): string {
    if (!this.isStudent) {
      return 'No aplica';
    }

    return this.formatDate(
      this.user?.student?.endClassDate
    );
  }

  get isSuspended(): boolean {
    if (!this.isStudent) {
      return false;
    }

    return (
      this.user?.suspensionInfo
        ?.isSuspended ??
      false
    );
  }

  get suspensionLabel(): string {
    if (!this.isStudent) {
      return 'Solo estudiantes';
    }

    return this.isSuspended
      ? 'Suspendido'
      : 'No suspendido';
  }

  get academicStatusMessage(): string {
    if (!this.isStudent) {
      return 'Información disponible solo para estudiantes';
    }

    return this.isSuspended
      ? 'El estudiante presenta una suspensión académica activa'
      : 'El estudiante mantiene su actividad académica habilitada';
  }

  get academicStatusDescription(): string {
    if (!this.isStudent) {
      return 'Las fechas de clases y el estado de suspensión corresponden únicamente al perfil académico del estudiante.';
    }

    return this.isSuspended
      ? 'Consulta el periodo y la razón asociados a la suspensión.'
      : 'No existen suspensiones académicas registradas actualmente.';
  }

  get statusType():
    | 'active'
    | 'suspended'
    | 'informative' {
    if (!this.isStudent) {
      return 'informative';
    }

    return this.isSuspended
      ? 'suspended'
      : 'active';
  }

  get schedulingBlockReason(): string {
    if (!this.isStudent) {
      return 'No aplica';
    }

    return (
      this.user
        ?.schedulingBlockReason
        ?.trim() ||
      '—'
    );
  }

  get suspensionStartDate(): string | null {
    if (
      !this.isStudent ||
      !this.isSuspended
    ) {
      return null;
    }

    const value =
      this.user?.student
        ?.suspensionStartDate;

    return value
      ? this.formatDate(value)
      : null;
  }

  get suspensionEndDate(): string | null {
    if (
      !this.isStudent ||
      !this.isSuspended
    ) {
      return null;
    }

    const value =
      this.user?.student
        ?.suspensionEndDate;

    return value
      ? this.formatDate(value)
      : null;
  }

  get suspensionDays(): number | null {
    if (
      !this.isStudent ||
      !this.isSuspended
    ) {
      return null;
    }

    return (
      this.user?.student
        ?.suspensionDays ??
      null
    );
  }

  private formatDate(
    value: string | Date | null | undefined
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  }
}