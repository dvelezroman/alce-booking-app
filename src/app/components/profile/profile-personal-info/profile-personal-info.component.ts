import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDto } from '../../../services/dtos/user.dto';
import { formatBirthday } from '../../../shared/utils/dates.util';

type PersonalInfoItem = {
  label: string;
  value: string;
  icon: PersonalInfoIcon;
  isHighlighted?: boolean;
};

type PersonalInfoIcon =
  | 'user'
  | 'calendar'
  | 'location'
  | 'country'
  | 'occupation'
  | 'phone'
  | 'email'
  | 'comment'
  | 'temporary-comment';

@Component({
  selector: 'app-profile-personal-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './profile-personal-info.component.html',
  styleUrl:
    './profile-personal-info.component.scss',
})
export class ProfilePersonalInfoComponent {
  @Input() user: UserDto | null = null;

  @Output() editProfile =
    new EventEmitter<void>();

  get personalInfoItems(): PersonalInfoItem[] {
    return [
      {
        label: 'Nombre completo',
        value: this.fullName,
        icon: 'user',
      },
      {
        label: 'Fecha de nacimiento',
        value: this.birthday,
        icon: 'calendar',
      },
      {
        label: 'Ciudad',
        value: this.city,
        icon: 'location',
      },
      {
        label: 'País',
        value: this.country,
        icon: 'country',
      },
      {
        label: 'Ocupación',
        value: this.occupation,
        icon: 'occupation',
      },
      {
        label: 'Contacto',
        value: this.contact,
        icon: 'phone',
      },
      {
        label: 'Correo alternativo',
        value: this.emailAddress,
        icon: 'email',
      },
      {
        label: 'Comentario',
        value: this.comment,
        icon: 'comment',
      },
      {
        label: 'Comentario temporal',
        value: this.temporaryComment,
        icon: 'temporary-comment',
        isHighlighted:
          this.temporaryComment !== '—',
      },
    ];
  }

  get fullName(): string {
    const firstName =
      this.user?.firstName?.trim() ?? '';

    const lastName =
      this.user?.lastName?.trim() ?? '';

    return (
      [firstName, lastName]
        .filter(Boolean)
        .join(' ') ||
      'No registrado'
    );
  }

  get birthday(): string {
    const value = this.user?.birthday;

    return value
      ? formatBirthday(value)
      : 'No registrado';
  }

  get city(): string {
    return (
      this.user?.city?.trim() ||
      'No registrado'
    );
  }

  get country(): string {
    const country =
      this.user?.country
        ?.trim()
        .toUpperCase();

    switch (country) {
      case 'EC':
        return 'Ecuador (EC)';

      case 'CO':
        return 'Colombia (CO)';

      case 'PE':
        return 'Perú (PE)';

      case 'US':
        return 'Estados Unidos (US)';

      case 'MX':
        return 'México (MX)';

      default:
        return (
          this.user?.country?.trim() ||
          'No registrado'
        );
    }
  }

  get occupation(): string {
    return (
      this.user?.occupation?.trim() ||
      'No registrado'
    );
  }

  get contact(): string {
    return (
      this.user?.contact?.trim() ||
      'No registrado'
    );
  }

  get emailAddress(): string {
    return (
      this.user?.emailAddress?.trim() ||
      'No registrado'
    );
  }

  get comment(): string {
    return (
      this.user?.comment?.trim() ||
      '—'
    );
  }

  get temporaryComment(): string {
    return (
      this.user?.temporaryComment
        ?.trim() ||
      '—'
    );
  }

  onEditProfile(): void {
    this.editProfile.emit();
  }

  trackByLabel(
    _index: number,
    item: PersonalInfoItem
  ): string {
    return item.label;
  }
}