import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';

import {
  BroadcastDeliveryOptionsComponent,
  BroadcastDeliveryOptionsValue,
} from '../../../../components/notifications/broadcast-group/broadcast-delivery-options/broadcast-delivery-options.component';

import {
  BroadcastNotificationContentComponent,
  BroadcastNotificationContentValue,
} from '../../../../components/notifications/broadcast-group/broadcast-notification-content/broadcast-notification-content.component';

import { BroadcastNotificationPreviewComponent } from '../../../../components/notifications/broadcast-group/broadcast-notification-preview/broadcast-notification-preview.component';
import { BroadcastRecipientSelectorComponent } from '../../../../components/notifications/broadcast-group/broadcast-recipient-selector/broadcast-recipient-selector.component';
import { BroadcastSendActionComponent } from '../../../../components/notifications/broadcast-group/broadcast-send-action/broadcast-send-action.component';
import { BroadcastSendSummaryComponent } from '../../../../components/notifications/broadcast-group/broadcast-send-summary/broadcast-send-summary.component';

import {
  CreateNotificationDto,
  CreateNotificationsBulkDto,
  NotificationGroupDto,
} from '../../../../services/dtos/notification.dto';

import { Stage } from '../../../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../../../services/dtos/user.dto';

import { NotificationGroupService } from '../../../../services/notification-group.service';
import { NotificationService } from '../../../../services/notification.service';
import { StagesService } from '../../../../services/stages.service';
import { UsersService } from '../../../../services/users.service';

import { selectUserData } from '../../../../store/user.selector';


@Component({
  selector: 'app-broadcast-groups-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    BroadcastRecipientSelectorComponent,
    BroadcastNotificationContentComponent,
    BroadcastDeliveryOptionsComponent,
    BroadcastSendSummaryComponent,
    BroadcastNotificationPreviewComponent,
    BroadcastSendActionComponent,
  ],
  templateUrl: './broadcast-groups-v2.component.html',
  styleUrl: './broadcast-groups-v2.component.scss',
})
export class BroadcastGroupsV2Component implements OnInit {

  protected readonly UserRole = UserRole;

  /* =========================
     SELECTION
  ========================= */

  selectedAction: 'user' | 'stage' | 'group' | 'role' | 'segment' | '' = '';
  selectedUser: UserDto | null = null;
  selectedRole: 'student' | 'instructor' | 'admin' | null = null;
  selectedStage: Stage | null = null;

  /* =========================
     STAGES
  ========================= */

  stages: Stage[] = [];

  /* =========================
     MODAL
  ========================= */

  modal: ModalDto = modalInitializer();

  /* =========================
     RESET
  ========================= */

  resetChildren = false;

  /* =========================
     AUTH USER
  ========================= */

  userRole: UserRole | null = null;
  senderId: number | null = null;

  /* =========================
     GROUPS
  ========================= */

  groups: NotificationGroupDto[] = [];
  loadingGroups = false;

  /* =========================
     CONTENT STATE
  ========================= */

  notificationContent: BroadcastNotificationContentValue = {
    title: '',
    message: '',
    notificationType: null,
    priority: 1,
  };

  /* =========================
     DELIVERY STATE
  ========================= */

  deliveryOptions: BroadcastDeliveryOptionsValue = {
    isPersistent: false,
    isDeletable: false,
    isTemporal: false,
  };


  constructor(
    private store: Store,
    private router: Router,
    private stagesService: StagesService,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private notificationGroupService: NotificationGroupService,
  ) {}


  ngOnInit(): void {
    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((u: UserDto | null) => {
        if (u?.role) {
          this.userRole = u.role;
          this.senderId = u.id;
          return;
        }

        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;

        if (!token) {
          this.userRole = null;
          this.senderId = null;
          return;
        }

        this.usersService.refreshLogin().subscribe({
          next: (resp) => {
            this.userRole = resp.role ?? null;
            this.senderId = resp.id ?? null;
          },
          error: () => {
            this.userRole = null;
            this.senderId = null;
          },
        });
      });

    this.stagesService.getAll().subscribe((response: Stage[]) => {
      this.stages = response
        .filter((stage) => {
          const match = stage.description.match(/stage\s+(\d+)/i);

          if (!match) {
            return false;
          }

          const stageNumber = +match[1];

          return stageNumber >= 1 && stageNumber <= 19;
        })
        .sort((a, b) => {
          const aNumber = +(a.description.match(/stage\s+(\d+)/i)?.[1] || 0);
          const bNumber = +(b.description.match(/stage\s+(\d+)/i)?.[1] || 0);

          return aNumber - bNumber;
        });
    });
  }


  /* =========================
     NAVIGATION
  ========================= */

  goToInbox(): void {
    this.router.navigate(['/dashboard/notifications-inbox']);
  }

  goToSentNotifications(): void {
    this.router.navigate(['/dashboard/notifications-sent']);
  }


  /* =========================
     GROUPS
  ========================= */

  private loadGroups(): void {
    this.loadingGroups = true;

    this.notificationGroupService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.notificationGroups;
        this.loadingGroups = false;
      },
      error: (err) => {
        console.error('Error al obtener grupos:', err);

        this.groups = [];
        this.loadingGroups = false;
      },
    });
  }


  /* =========================
     RECIPIENT EVENTS
  ========================= */

  handleUserSelect(user: UserDto | null): void {
    this.selectedUser = user;
  }

  handleStageSelect(stage: Stage | null): void {
    this.selectedStage = stage;
  }

  handleRoleSelect(role: 'student' | 'instructor' | 'admin' | null): void {
    this.selectedRole = role;
  }


  /* =========================
     CONTENT EVENT
  ========================= */

  handleNotificationContentChange(content: BroadcastNotificationContentValue): void {
    this.notificationContent = content;
  }


  /* =========================
     DELIVERY EVENT
  ========================= */

  handleDeliveryOptionsChange(options: BroadcastDeliveryOptionsValue): void {
    this.deliveryOptions = options;
  }


  /* =========================
     RESET
  ========================= */

  private clearSelection(): void {
    this.selectedAction = '';
    this.selectedUser = null;
    this.selectedStage = null;
    this.selectedRole = null;

    this.notificationContent = {
      title: '',
      message: '',
      notificationType: null,
      priority: 1,
    };

    this.deliveryOptions = {
      isPersistent: false,
      isDeletable: false,
      isTemporal: false,
    };

    this.groups = [];

    this.resetChildren = true;

    setTimeout(() => {
      this.resetChildren = false;
    }, 0);
  }


  /* =========================
     SEND OPTION
  ========================= */

  onSendOptionSelected(
    option: 'user' | 'stage' | 'group' | 'role' | 'segment',
  ): void {
    this.selectedAction = option;

    if (option !== 'user') {
      this.selectedUser = null;
    }

    if (option !== 'stage') {
      this.selectedStage = null;
    }

    if (option !== 'role') {
      this.selectedRole = null;
    }

    if (option !== 'group') {
      this.groups = [];
    }

    if (option === 'group') {
      this.loadGroups();
    }
  }


  /* =========================
     SUBMIT
  ========================= */

  handleNotificationSubmit(payload: CreateNotificationDto): void {

    /* =========================
       SEGMENT → BULK
    ========================= */

    if (this.selectedAction === 'segment') {
      const bulkPayload: CreateNotificationsBulkDto = {
        notifications: [payload],
      };

      this.notificationService.createBulk(bulkPayload).subscribe({
        next: () => {
          this.showModal({
            isSuccess: true,
            title: 'Notificación enviada',
            message: 'La notificación por segmento fue enviada con éxito.',
          });

          this.clearSelection();
        },
        error: (err) => {
          console.error('Error al enviar notificación bulk:', err);

          this.showModal({
            isError: true,
            title: 'Error al enviar',
            message: 'Ocurrió un error al enviar la notificación por segmento.',
          });
        },
      });

      return;
    }


    /* =========================
       NORMAL → CREATE
    ========================= */

    const ids = Array.isArray(payload.to)
      ? Array.from(
          new Set(
            payload.to.filter(
              (id): id is number => typeof id === 'number',
            ),
          ),
        )
      : [];

    if (ids.length === 0) {
      this.showModal({
        isError: true,
        title: 'Sin destinatarios',
        message: 'No se encontró ningún usuario para enviar la notificación.',
      });

      return;
    }

    const finalPayload: CreateNotificationDto = {
      ...payload,
      to: ids,
    };

    this.notificationService.create(finalPayload).subscribe({
      next: () => {
        this.showModal({
          isSuccess: true,
          title: 'Notificación enviada',
          message: 'La notificación ha sido enviada con éxito.',
        });

        this.clearSelection();
      },
      error: (err) => {
        console.error('Error al crear notificación:', err);

        this.showModal({
          isError: true,
          title: 'Error al enviar',
          message: 'Ocurrió un error al enviar la notificación.',
        });
      },
    });
  }


  /* =========================
     MODAL
  ========================= */

  private showModal({
    title = '',
    message = '',
    isSuccess = false,
    isError = false,
    duration = 2000,
  }: {
    title?: string;
    message?: string;
    isSuccess?: boolean;
    isError?: boolean;
    duration?: number;
  }): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isSuccess,
      isError,
      close: () => (this.modal.show = false),
    };

    setTimeout(() => {
      this.modal.show = false;
    }, duration);
  }

}