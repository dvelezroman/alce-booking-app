import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  UserDto,
} from '../../../../services/dtos/user.dto';

import {
  Stage,
} from '../../../../services/dtos/student.dto';

import {
  NotificationGroupDto,
  NotificationTypeEnum,
} from '../../../../services/dtos/notification.dto';


type SelectedAction =
  | 'user'
  | 'stage'
  | 'group'
  | 'role'
  | 'segment'
  | '';

type RecipientRole =
  | 'student'
  | 'instructor'
  | 'admin';


@Component({
  selector: 'app-broadcast-send-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './broadcast-send-summary.component.html',
  styleUrl: './broadcast-send-summary.component.scss',
})
export class BroadcastSendSummaryComponent {

  /* =========================
     RECIPIENT INPUTS
  ========================= */

  @Input() selectedAction: SelectedAction = '';

  @Input() selectedUser: UserDto | null = null;

  @Input() selectedStage: Stage | null = null;

  @Input() selectedRole: RecipientRole | null = null;

  @Input() groups: NotificationGroupDto[] = [];


  /* =========================
     CONTENT INPUTS
     Se conectarán desde el padre
  ========================= */

  @Input() notificationType: NotificationTypeEnum | null = null;

  @Input() priority: number = 1;


  /* =========================
     DELIVERY INPUTS
  ========================= */

  @Input() scheduledAt: string | null = null;

  @Input() expiresAt: string | null = null;


  /* =========================
     RECIPIENT
  ========================= */

  get recipientTitle(): string {

    switch (this.selectedAction) {

      case 'user':
        return this.selectedUserName;

      case 'stage':
        return this.selectedStageLabel;

      case 'group':
        return 'Grupo seleccionado';

      case 'role':
        return this.selectedRoleLabel;

      case 'segment':
        return 'Segmento seleccionado';

      default:
        return 'Sin destinatario';

    }

  }


  get recipientDescription(): string {

    switch (this.selectedAction) {

      case 'user':
        return this.selectedUserEmail;

      case 'stage':
        return 'Estudiantes del stage';

      case 'group':
        return 'Grupo de usuarios';

      case 'role':
        return 'Usuarios por rol';

      case 'segment':
        return 'Segmento personalizado';

      default:
        return 'Selecciona un destinatario';

    }

  }


  get recipientCountLabel(): string {

    switch (this.selectedAction) {

      case 'user':
        return this.selectedUser
          ? '1 usuario'
          : '0 usuarios';

      case 'stage':
        return this.selectedStage
          ? 'Stage'
          : '0 usuarios';

      case 'group':
        return 'Grupo';

      case 'role':
        return this.selectedRole
          ? 'Rol'
          : '0 usuarios';

      case 'segment':
        return 'Segmento';

      default:
        return '0 usuarios';

    }

  }


  /* =========================
     USER
  ========================= */

  get selectedUserName(): string {

    if (!this.selectedUser) {
      return 'Sin usuario';
    }

    const firstName =
      this.selectedUser.firstName
        ?.trim() ??
      '';

    const lastName =
      this.selectedUser.lastName
        ?.trim() ??
      '';

    return (
      `${firstName} ${lastName}`
        .trim() ||
      'Usuario'
    );

  }


  get selectedUserEmail(): string {

    return (
      this.selectedUser?.email ??
      this.selectedUser?.emailAddress ??
      'Sin correo'
    );

  }


  get selectedUserInitials(): string {

    if (!this.selectedUser) {
      return 'US';
    }

    const firstName =
      this.selectedUser.firstName
        ?.trim()
        ?.charAt(0) ??
      '';

    const lastName =
      this.selectedUser.lastName
        ?.trim()
        ?.charAt(0) ??
      '';

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'US'
    );

  }


  /* =========================
     STAGE
  ========================= */

  get selectedStageLabel(): string {

    if (!this.selectedStage) {
      return 'Sin stage';
    }

    const number =
      String(
        this.selectedStage.number ?? '',
      )
        .replace(/[^0-9.]/g, '')
        .trim();

    if (number) {
      return `Stage ${number}`;
    }

    return (
      this.selectedStage.description ??
      'Stage'
    );

  }


  /* =========================
     ROLE
  ========================= */

  get selectedRoleLabel(): string {

    switch (this.selectedRole) {

      case 'student':
        return 'Estudiantes';

      case 'instructor':
        return 'Instructores';

      case 'admin':
        return 'Administradores';

      default:
        return 'Sin rol';

    }

  }


  /* =========================
     TYPE
  ========================= */

  get notificationTypeLabel(): string {

    if (!this.notificationType) {
      return '--';
    }

    switch (this.notificationType) {

      case NotificationTypeEnum.Announce:
        return 'Anuncio';

      case NotificationTypeEnum.Advice:
        return 'Aviso';

      case NotificationTypeEnum.Commentary:
        return 'Comentario';

      case NotificationTypeEnum.Mandatory:
        return 'Obligatoria';

      case NotificationTypeEnum.System:
        return 'Sistema';

      case NotificationTypeEnum.Meeting:
        return 'Clase';

      case NotificationTypeEnum.Assessment:
        return 'Evaluación';

      default:
        return String(
          this.notificationType,
        );

    }

  }


  /* =========================
     PRIORITY
  ========================= */

  get priorityLabel(): string {

    switch (this.priority) {

      case 0:
        return 'Baja';

      case 1:
        return 'Normal';

      case 2:
        return 'Alta';

      case 3:
        return 'Urgente';

      default:
        return 'Normal';

    }

  }


  get priorityClass(): string {

    switch (this.priority) {

      case 0:
        return 'low';

      case 1:
        return 'normal';

      case 2:
        return 'high';

      case 3:
        return 'urgent';

      default:
        return 'normal';

    }

  }


  /* =========================
     SCHEDULE
  ========================= */

  get scheduledLabel(): string {

    if (!this.scheduledAt) {
      return 'No programado';
    }

    return this.formatDateTime(
      this.scheduledAt,
    );

  }


  /* =========================
     EXPIRATION
  ========================= */

  get expirationLabel(): string {

    if (!this.expiresAt) {
      return 'Sin expiración';
    }

    return this.formatDateTime(
      this.expiresAt,
    );

  }


  /* =========================
     HELPERS
  ========================= */

  private formatDateTime(
    value: string,
  ): string {

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone:
          'America/Guayaquil',
      },
    ).format(date);

  }

}