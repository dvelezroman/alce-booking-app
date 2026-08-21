import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  UserDto,
} from '../../../services/dtos/user.dto';

import {
  Stage,
} from '../../../services/dtos/student.dto';


type EmailSummaryRecipientType =
  | 'user'
  | 'stage'
  | 'group'
  | 'role';


@Component({
  selector: 'app-email-send-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './email-send-summary.component.html',
  styleUrl:
    './email-send-summary.component.scss',
})
export class EmailSendSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  selectedType:
    EmailSummaryRecipientType | '' = 'user';

  @Input()
  selectedUser:
    UserDto | null = null;

  @Input()
  selectedStage:
    Stage | null = null;

  @Input()
  selectedRole:
    'student'
    | 'instructor'
    | 'admin'
    | null = null;


  /* =========================
     LABELS
  ========================= */

  get recipientTypeLabel(): string {
    switch (this.selectedType) {
      case 'user':
        return 'Usuario';

      case 'stage':
        return 'Stage';

      case 'group':
        return 'Grupo';

      case 'role':
        return 'Rol';

      default:
        return 'Sin seleccionar';
    }
  }


  get recipientLabel(): string {
    switch (this.selectedType) {
      case 'user':
        return this.selectedUser
          ? this.getUserName(this.selectedUser)
          : 'Selecciona un usuario';

      case 'stage':
        return (
          this.selectedStage?.description ||
          'Selecciona un stage'
        );

      case 'group':
        return 'Grupo seleccionado';

      case 'role':
        return this.getRoleLabel();

      default:
        return 'Sin destinatario';
    }
  }


  get recipientDescription(): string {
    switch (this.selectedType) {
      case 'user':
        return (
          this.selectedUser?.email ||
          'Selecciona un usuario para continuar'
        );

      case 'stage':
        return this.selectedStage
          ? 'Todos los destinatarios del stage seleccionado'
          : 'Selecciona una etapa';

      case 'group':
        return 'Todos los integrantes del grupo seleccionado';

      case 'role':
        return this.selectedRole
          ? 'Todos los usuarios pertenecientes a este rol'
          : 'Selecciona un rol';

      default:
        return 'Configura el destinatario del email';
    }
  }


  /* =========================
     STATUS
  ========================= */

  get hasRecipient(): boolean {
    switch (this.selectedType) {
      case 'user':
        return !!this.selectedUser;

      case 'stage':
        return !!this.selectedStage;

      case 'role':
        return !!this.selectedRole;

      case 'group':
        /*
         * El componente padre actual no está pasando
         * selectedGroup todavía.
         */
        return true;

      default:
        return false;
    }
  }


  get statusLabel(): string {
    return this.hasRecipient
      ? 'Listo'
      : 'Pendiente';
  }


  /* =========================
     USER
  ========================= */

  getUserName(
    user: UserDto,
  ): string {
    const name = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      name ||
      user.email ||
      'Usuario'
    );
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
      user.email
        ?.charAt(0)
        .toUpperCase() ||
      'U'
    );
  }


  /* =========================
     ROLE
  ========================= */

  private getRoleLabel(): string {
    switch (this.selectedRole) {
      case 'student':
        return 'Estudiantes';

      case 'instructor':
        return 'Instructores';

      case 'admin':
        return 'Administradores';

      default:
        return 'Selecciona un rol';
    }
  }
}