import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { UserDto } from '../../../../services/dtos/user.dto';
import { Stage } from '../../../../services/dtos/student.dto';
import { NotificationTypeEnum } from '../../../../services/dtos/notification.dto';


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
  selector: 'app-broadcast-notification-preview',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './broadcast-notification-preview.component.html',
  styleUrl: './broadcast-notification-preview.component.scss',
})
export class BroadcastNotificationPreviewComponent {

  /* =========================
     RECIPIENT INPUTS
  ========================= */

  @Input() selectedAction: SelectedAction = '';
  @Input() selectedUser: UserDto | null = null;
  @Input() selectedStage: Stage | null = null;
  @Input() selectedRole: RecipientRole | null = null;


  /* =========================
     CONTENT INPUTS
     Se conectarán desde el padre
  ========================= */

  @Input() title: string = '';
  @Input() message: string = '';
  @Input() notificationType: NotificationTypeEnum | null = null;
  @Input() priority: number = 1;


  /* =========================
     TITLE
  ========================= */

  get previewTitle(): string {
    const value = this.title.trim();

    return value || 'Título de la notificación';
  }


  /* =========================
     MESSAGE
  ========================= */

  get previewMessage(): string {
    const value = this.message.trim();

    return value ||
      'Aquí se mostrará el contenido del mensaje tal como lo recibirá el destinatario.';
  }


  /* =========================
     RECIPIENT
  ========================= */

  get recipientLabel(): string {
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


  /* =========================
     USER
  ========================= */

  get selectedUserName(): string {
    if (!this.selectedUser) {
      return 'Sin usuario';
    }

    const firstName = this.selectedUser.firstName?.trim() ?? '';
    const lastName = this.selectedUser.lastName?.trim() ?? '';

    return `${firstName} ${lastName}`.trim() || 'Usuario';
  }


  /* =========================
     STAGE
  ========================= */

  get selectedStageLabel(): string {
    if (!this.selectedStage) {
      return 'Sin stage';
    }

    const number = String(
      this.selectedStage.number ?? '',
    )
      .replace(/[^0-9.]/g, '')
      .trim();

    if (number) {
      return `Stage ${number}`;
    }

    return this.selectedStage.description ?? 'Stage';
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
      return 'Notificación';
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
        return String(this.notificationType);
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
     SENDER
  ========================= */

  get senderLabel(): string {
    return 'tu-email@institucion.com';
  }

}