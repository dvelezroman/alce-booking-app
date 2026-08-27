import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserDto } from '../../../../services/dtos/user.dto';
import { Stage } from '../../../../services/dtos/student.dto';
import {
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

export interface BroadcastNotificationContentValue {
  title: string;
  message: string;
  notificationType: NotificationTypeEnum | null;
  priority: number;
}

@Component({
  selector: 'app-broadcast-notification-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './broadcast-notification-content.component.html',
  styleUrl: './broadcast-notification-content.component.scss',
})
export class BroadcastNotificationContentComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() selectedAction: SelectedAction = '';
  @Input() selectedUsers: UserDto[] = [];
  @Input() selectedStage: Stage | null = null;
  @Input() selectedRole: RecipientRole | null = null;
  @Input() reset = false;
  @Input() showValidationErrors = false;


  /* =========================
     OUTPUT
  ========================= */

  @Output() contentChanged =
    new EventEmitter<BroadcastNotificationContentValue>();


  /* =========================
     FORM
  ========================= */

  title = '';
  message = '';
  selectedNotificationType: NotificationTypeEnum | null = null;
  selectedPriority = 1;


  /* =========================
     UI
  ========================= */

  showTypeDropdown = false;


  /* =========================
     LIMITS
  ========================= */

  readonly titleMaxLength = 120;
  readonly messageMaxLength = 2000;


  /* =========================
     TYPES
  ========================= */

  notificationTypes: NotificationTypeEnum[] = [
    NotificationTypeEnum.Announce,
    NotificationTypeEnum.Advice,
    NotificationTypeEnum.Commentary,
    NotificationTypeEnum.Mandatory,
    NotificationTypeEnum.System,
    NotificationTypeEnum.Meeting,
    NotificationTypeEnum.Assessment,
  ];


  /* =========================
     PRIORITIES
  ========================= */

  readonly priorityOptions = [
    {
      value: 0,
      label: 'Baja',
    },
    {
      value: 1,
      label: 'Normal',
    },
    {
      value: 2,
      label: 'Alta',
    },
    {
      value: 3,
      label: 'Urgente',
    },
  ];


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['reset'] &&
      this.reset
    ) {
      this.resetForm();
    }
  }


  /* =========================
     TITLE
  ========================= */

  onTitleChange(value: string): void {
    this.title =
      value.slice(
        0,
        this.titleMaxLength,
      );

    this.emitValue();
  }


  get titleLength(): number {
    return this.title.length;
  }


  /* =========================
     MESSAGE
  ========================= */

  onMessageChange(value: string): void {
    this.message =
      value.slice(
        0,
        this.messageMaxLength,
      );

    this.emitValue();
  }


  get messageLength(): number {
    return this.message.length;
  }


  /* =========================
     TYPE
  ========================= */

  toggleTypeDropdown(): void {
    this.showTypeDropdown =
      !this.showTypeDropdown;
  }


  selectNotificationType(
    type: NotificationTypeEnum,
  ): void {
    this.selectedNotificationType =
      type;

    this.showTypeDropdown =
      false;

    this.emitValue();
  }


  get selectedNotificationTypeLabel(): string {
    if (!this.selectedNotificationType) {
      return 'Selecciona un tipo';
    }

    return this.getNotificationTypeLabel(
      this.selectedNotificationType,
    );
  }


  getNotificationTypeLabel(
    type: NotificationTypeEnum,
  ): string {
    switch (type) {
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
        return String(type);
    }
  }


  /* =========================
     PRIORITY
  ========================= */

  selectPriority(
    priority: number,
  ): void {
    this.selectedPriority =
      priority;

    this.emitValue();
  }


  isPrioritySelected(
    priority: number,
  ): boolean {
    return (
      this.selectedPriority ===
      priority
    );
  }


  get selectedPriorityLabel(): string {
    return (
      this.priorityOptions.find(
        option =>
          option.value ===
          this.selectedPriority,
      )?.label ??
      'Normal'
    );
  }


  /* =========================
     RECIPIENT STATE
  ========================= */

  get hasRecipientSelected(): boolean {
    switch (this.selectedAction) {
      case 'user':
        return this.selectedUsers.length > 0;

      case 'stage':
        return !!this.selectedStage;

      case 'role':
        return !!this.selectedRole;

      case 'group':
      case 'segment':
        return true;

      default:
        return false;
    }
  }


  get isFormEnabled(): boolean {
    return this.hasRecipientSelected;
  }


  /* =========================
     VALIDATION
  ========================= */

  get hasValidTitle(): boolean {
    return this.title.trim().length > 0;
  }


  get hasValidMessage(): boolean {
    return this.message.trim().length > 0;
  }


  get hasValidType(): boolean {
    return !!this.selectedNotificationType;
  }


  get isValid(): boolean {
    return (
      this.hasValidTitle &&
      this.hasValidMessage &&
      this.hasValidType
    );
  }


  /* =========================
     VALUE
  ========================= */

  get value(): BroadcastNotificationContentValue {
    return {
      title:
        this.title.trim(),

      message:
        this.message.trim(),

      notificationType:
        this.selectedNotificationType,

      priority:
        this.selectedPriority,
    };
  }


  private emitValue(): void {
    this.contentChanged.emit(
      this.value,
    );
  }


  /* =========================
     RESET
  ========================= */

  private resetForm(): void {
    this.title = '';

    this.message = '';

    this.selectedNotificationType =
      null;

    this.selectedPriority = 1;

    this.showTypeDropdown =
      false;

    this.emitValue();
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByNotificationType(
    index: number,
    type: NotificationTypeEnum,
  ): string {
    return String(type);
  }


  trackByPriority(
    index: number,
    option: {
      value: number;
      label: string;
    },
  ): number {
    return option.value;
  }

}
