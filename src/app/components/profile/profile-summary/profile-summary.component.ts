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
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-profile-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-summary.component.html',
  styleUrl:
    './profile-summary.component.scss',
})
export class ProfileSummaryComponent {
  @Input() user: UserDto | null = null;

  @Output() editProfile =
    new EventEmitter<void>();

  get fullName(): string {
    const firstName =
      this.user?.firstName?.trim() ?? '';

    const lastName =
      this.user?.lastName?.trim() ?? '';

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ');

    return fullName || 'Estudiante';
  }

  get initials(): string {
    const firstInitial =
      this.user?.firstName
        ?.trim()
        .charAt(0) ?? '';

    const lastInitial =
      this.user?.lastName
        ?.trim()
        .charAt(0) ?? '';

    const initials =
      `${firstInitial}${lastInitial}`
        .toUpperCase();

    return initials || 'E';
  }

  get roleLabel(): string {
    switch (this.user?.role) {
      case UserRole.STUDENT:
        return 'Estudiante';

      case UserRole.INSTRUCTOR:
        return 'Instructor';

      case UserRole.ADMIN:
        return 'Administrador';

      default:
        return 'Usuario';
    }
  }

  get statusLabel(): string {
    switch (
      this.user?.status
        ?.toString()
        .toUpperCase()
    ) {
      case 'ACTIVE':
        return 'Activo';

      case 'INACTIVE':
        return 'Inactivo';

      case 'SUSPENDED':
        return 'Suspendido';

      default:
        return 'Sin estado';
    }
  }

  get statusClass(): string {
    switch (
      this.user?.status
        ?.toString()
        .toUpperCase()
    ) {
      case 'ACTIVE':
        return 'profile-summary__status--active';

      case 'SUSPENDED':
        return 'profile-summary__status--suspended';

      case 'INACTIVE':
        return 'profile-summary__status--inactive';

      default:
        return 'profile-summary__status--default';
    }
  }

  get username(): string {
    return (
      this.user?.email?.trim() ||
      'Usuario no registrado'
    );
  }

  get emailAddress(): string {
    return (
      this.user?.emailAddress?.trim() ||
      'Correo no registrado'
    );
  }

  get contact(): string {
    return (
      this.user?.contact?.trim() ||
      'Contacto no registrado'
    );
  }

  get memberSince(): string {
    const createdAt =
      this.user?.student?.createdAt ??
      this.user?.createdAt;

    if (!createdAt) {
      return 'No registrado';
    }

    const date = new Date(createdAt);

    if (
      Number.isNaN(date.getTime())
    ) {
      return 'No registrado';
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

  onEditProfile(): void {
    this.editProfile.emit();
  }
}