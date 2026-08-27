import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { UserDto } from '../../../../services/dtos/user.dto';
import {
  Stage,
  StudentClassification,
} from '../../../../services/dtos/student.dto';

import {
  CreateNotificationDto,
  NotificationTypeEnum,
} from '../../../../services/dtos/notification.dto';

import {
  BroadcastNotificationContentValue,
} from '../broadcast-notification-content/broadcast-notification-content.component';

import {
  BroadcastDeliveryOptionsValue,
} from '../broadcast-delivery-options/broadcast-delivery-options.component';


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


export interface BroadcastSegmentValue {
  studentClassification?: StudentClassification;
  city?: string;
}


@Component({
  selector: 'app-broadcast-send-action',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './broadcast-send-action.component.html',
  styleUrl: './broadcast-send-action.component.scss',
})
export class BroadcastSendActionComponent implements OnChanges {

  /* =========================
     RECIPIENT INPUTS
  ========================= */

  @Input() selectedAction: SelectedAction = '';
  @Input() selectedUser: UserDto | null = null;
  @Input() selectedStage: Stage | null = null;
  @Input() selectedRole: RecipientRole | null = null;
  @Input() submitFinished = 0;


  /* =========================
     GROUP
  ========================= */

  @Input() selectedGroupUserIds: number[] = [];


  /* =========================
     SEGMENT
  ========================= */

  @Input() selectedSegment: | 'kids' | 'teens' | 'adults' | 'city' | null = null;


  /* =========================
     CONTENT
  ========================= */

  @Input() notificationContent: BroadcastNotificationContentValue = {
    title: '',
    message: '',
    notificationType: null,
    priority: 1,
  };


  /* =========================
     DELIVERY
  ========================= */

  @Input() deliveryOptions: BroadcastDeliveryOptionsValue = {
    isPersistent: false,
    isDeletable: false,
    isTemporal: false,
  };


  /* =========================
     SENDER
  ========================= */

  @Input() senderId: number | null = null;


  /* =========================
     RESET
  ========================= */

  @Input() reset = false;


  /* =========================
     OUTPUT
  ========================= */

  @Output() notificationSubmitted =
    new EventEmitter<CreateNotificationDto>();

  @Output() validationRequested =
    new EventEmitter<void>();


  /* =========================
     UI
  ========================= */

  isSubmitting = false;


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['reset'] &&
      this.reset
    ) {
      this.isSubmitting = false;
    }

    if (
      changes['submitFinished'] &&
      !changes['submitFinished'].firstChange
    ) {
      this.isSubmitting = false;
    }
  }


  /* =========================
     RECIPIENT VALIDATION
  ========================= */

  get hasRecipient(): boolean {
    switch (this.selectedAction) {
      case 'user':
        return !!this.selectedUser?.id;

      case 'stage':
        return !!this.selectedStage?.id;

      case 'group':
        return this.selectedGroupUserIds.length > 0;

      case 'role':
        return !!this.selectedRole;

      case 'segment':
        return !!this.selectedSegment;

      default:
        return false;
    }
  }


  /* =========================
     CONTENT VALIDATION
  ========================= */

  get hasValidContent(): boolean {
    return !!(
      this.notificationContent.title.trim() &&
      this.notificationContent.message.trim() &&
      this.notificationContent.notificationType
    );
  }


  /* =========================
     DELIVERY VALIDATION
  ========================= */

  get hasValidDelivery(): boolean {
    if (
      this.deliveryOptions.scheduledAt &&
      !this.isValidDate(
        this.deliveryOptions.scheduledAt,
      )
    ) {
      return false;
    }

    if (
      this.deliveryOptions.expiresAt &&
      !this.isValidDate(
        this.deliveryOptions.expiresAt,
      )
    ) {
      return false;
    }

    if (
      this.deliveryOptions.scheduledAt &&
      this.deliveryOptions.expiresAt
    ) {
      const scheduledAt =
        new Date(
          this.deliveryOptions.scheduledAt,
        ).getTime();

      const expiresAt =
        new Date(
          this.deliveryOptions.expiresAt,
        ).getTime();

      if (
        expiresAt <= scheduledAt
      ) {
        return false;
      }
    }

    return true;
  }


  /* =========================
     SUBMIT STATE
  ========================= */

  get canSubmit(): boolean {
    return !!(
      this.senderId &&
      this.hasRecipient &&
      this.hasValidContent &&
      this.hasValidDelivery &&
      !this.isSubmitting
    );
  }


  /* =========================
     VALIDATION MESSAGE
  ========================= */

  get validationMessage(): string | null {
    if (!this.senderId) {
      return 'No se pudo identificar al usuario que envía la notificación.';
    }

    if (!this.selectedAction) {
      return 'Selecciona un tipo de destinatario.';
    }

    if (!this.hasRecipient) {
      return 'Selecciona al menos un destinatario.';
    }

    if (
      !this.notificationContent.title.trim()
    ) {
      return 'Ingresa el título de la notificación.';
    }

    if (
      !this.notificationContent.message.trim()
    ) {
      return 'Ingresa el mensaje de la notificación.';
    }

    if (
      !this.notificationContent.notificationType
    ) {
      return 'Selecciona el tipo de notificación.';
    }

    if (!this.hasValidDelivery) {
      return 'Revisa la configuración de envío y expiración.';
    }

    return null;
  }

  get isSubmitDisabled(): boolean {
    return this.isSubmitting;
  }


  /* =========================
     SUBMIT
  ========================= */

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    /*
    * El usuario intentó enviar.
    * Avisamos al padre para que los componentes
    * muestren sus validaciones visuales.
    */
    if (!this.canSubmit) {
      this.validationRequested.emit();
      return;
    }

    const payload =
      this.buildPayload();

    if (!payload) {
      this.validationRequested.emit();
      return;
    }

    this.isSubmitting = true;

    this.notificationSubmitted.emit(
      payload,
    );
  }


  /* =========================
     BUILD PAYLOAD
  ========================= */

  private buildPayload():
    CreateNotificationDto | null {

    if (
      !this.senderId ||
      !this.notificationContent.notificationType
    ) {
      return null;
    }

    const recipientData =
      this.buildRecipientData();

    if (!recipientData) {
      return null;
    }

    const payload: CreateNotificationDto = {
      from:
        this.senderId,

      to:
        recipientData.to,

      scope:
        recipientData.scope,

      ...(recipientData.stageId != null
        ? {
            stageId:
              recipientData.stageId,
          }
        : {}),

      ...(recipientData.studentClassification
        ? {
            studentClassification:
              recipientData.studentClassification,
          }
        : {}),

      ...(recipientData.city
        ? {
            city:
              recipientData.city,
          }
        : {}),

      title:
        this.notificationContent.title.trim(),

      message: {
        body:
          this.notificationContent.message.trim(),
      },

      notificationType:
        this.notificationContent.notificationType,

      priority:
        this.notificationContent.priority,

      ...(this.deliveryOptions.scheduledAt
        ? {
            scheduledAt:
              this.deliveryOptions.scheduledAt,
          }
        : {}),

      ...(this.deliveryOptions.expiresAt
        ? {
            expiresAt:
              this.deliveryOptions.expiresAt,
          }
        : {}),

      isPersistent:
        this.deliveryOptions.isPersistent,

      isDeletable:
        this.deliveryOptions.isDeletable,

      isTemporal:
        this.deliveryOptions.isTemporal,

      ...(this.deliveryOptions.temporalWindowType
        ? {
            temporalWindowType:
              this.deliveryOptions.temporalWindowType,
          }
        : {}),

      ...(this.deliveryOptions.temporalWindowValue != null
        ? {
            temporalWindowValue:
              this.deliveryOptions.temporalWindowValue,
          }
        : {}),

      ...(this.deliveryOptions.temporalWindowStart
        ? {
            temporalWindowStart:
              this.deliveryOptions.temporalWindowStart,
          }
        : {}),

      ...(this.deliveryOptions.temporalWindowEnd
        ? {
            temporalWindowEnd:
              this.deliveryOptions.temporalWindowEnd,
          }
        : {}),

      ...(this.deliveryOptions.temporalStageId != null
        ? {
            temporalStageId:
              this.deliveryOptions.temporalStageId,
          }
        : {}),
    };

    return payload;
  }


  /* =========================
     RECIPIENT DATA
  ========================= */

  private buildRecipientData(): {
    to: number[];
    scope:
      | 'INDIVIDUAL'
      | 'ALL_USERS'
      | 'ALL_STUDENTS'
      | 'ALL_INSTRUCTORS'
      | 'STAGE_STUDENTS';
    stageId?: number;
    studentClassification?: StudentClassification;
    city?: string;
  } | null {

    switch (this.selectedAction) {

      /* =========================
         USER
      ========================= */

      case 'user': {
        const userId =
          this.selectedUser?.id;

        if (!userId) {
          return null;
        }

        return {
          to: [
            userId,
          ],

          scope:
            'INDIVIDUAL',
        };
      }


      /* =========================
         STAGE
      ========================= */

      case 'stage': {
        const stageId =
          this.selectedStage?.id;

        if (!stageId) {
          return null;
        }

        return {
          /*
           * El backend determina los usuarios
           * mediante el stageId.
           */
          to: [],

          scope:
            'STAGE_STUDENTS',

          stageId,
        };
      }


      /* =========================
         GROUP
      ========================= */

      case 'group': {
        const ids =
          Array.from(
            new Set(
              this.selectedGroupUserIds.filter(
                id =>
                  typeof id === 'number',
              ),
            ),
          );

        if (
          ids.length === 0
        ) {
          return null;
        }

        return {
          to: ids,

          scope:
            'INDIVIDUAL',
        };
      }


      /* =========================
         ROLE
      ========================= */

      case 'role': {
        switch (this.selectedRole) {
          case 'student':
            return {
              to: [],
              scope:
                'ALL_STUDENTS',
            };

          case 'instructor':
            return {
              to: [],
              scope:
                'ALL_INSTRUCTORS',
            };

          case 'admin':
            /*
             * Tu CreateNotificationDto actualmente
             * no permite ALL_ADMINS.
             *
             * Por eso no construimos un payload
             * incorrecto aquí.
             */
            return null;

          default:
            return null;
        }
      }


      /* =========================
         SEGMENT
      ========================= */

      case 'segment': {
        if (!this.selectedSegment) {
          return null;
        }

        return {
          to: [],
          scope: 'INDIVIDUAL',
        };
      }


      default:
        return null;
    }
  }


  /* =========================
     HELPERS
  ========================= */

  private isValidDate(
    value: string,
  ): boolean {

    const date =
      new Date(value);

    return !Number.isNaN(
      date.getTime(),
    );
  }

}
