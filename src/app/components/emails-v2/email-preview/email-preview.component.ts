import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

@Component({
  selector: 'app-email-preview',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './email-preview.component.html',
  styleUrl: './email-preview.component.scss',
})
export class EmailPreviewComponent {

  /* =========================
     INPUT
  ========================= */

  @Input()
  selectedUser:
    UserDto | null = null;

  @Input()
  externalEmail:
   string | null = null;


  /* =========================
     USER NAME
  ========================= */

  get userName(): string {

    if (this.externalEmail) {
      return 'Destinatario externo';
    }

    if (!this.selectedUser) {
      return 'Destinatario';
    }

    const name = [
      this.selectedUser.firstName,
      this.selectedUser.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      name ||
      this.selectedUser.email ||
      this.selectedUser.emailAddress ||
      'Destinatario'
    );
  }


  /* =========================
     EMAIL
  ========================= */

  get userEmail(): string {

    if (this.externalEmail) {
      return this.externalEmail;
    }

    return (
      this.selectedUser?.emailAddress ||
      this.selectedUser?.email ||
      'correo@ejemplo.com'
    );
  }


  /* =========================
     INITIALS
  ========================= */

  get userInitials(): string {

    if (this.externalEmail) {
      return 'EX';
    }

    if (!this.selectedUser) {
      return 'DE';
    }

    const first =
      this.selectedUser.firstName
        ?.trim()
        .charAt(0) ?? '';

    const last =
      this.selectedUser.lastName
        ?.trim()
        .charAt(0) ?? '';

    const initials =
      `${first}${last}`
        .toUpperCase();

    return (
      initials ||
      this.selectedUser.emailAddress
        ?.charAt(0)
        .toUpperCase() ||
      this.selectedUser.email
        ?.charAt(0)
        .toUpperCase() ||
      'U'
    );
  }


  /* =========================
     HAS USER
  ========================= */

  get hasSelectedUser(): boolean {
    return Boolean(
      this.selectedUser ||
      this.externalEmail
    );
  }
}