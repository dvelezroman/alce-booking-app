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
import { StudentsService } from '../../../../services/students.service';


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

  showValidationErrors = false;
  submitFinished = 0;

  /* =========================
     SELECTION
  ========================= */

  selectedAction: 'user' | 'stage' | 'group' | 'role' | 'segment' | '' = '';
  selectedUser: UserDto | null = null;
  selectedRole: 'student' | 'instructor' | 'admin' | null = null;
  selectedStage: Stage | null = null;
  selectedStageUsers: UserDto[] = [];
  selectedSegment: | 'kids' | 'teens' | 'adults' | 'city' | null = null;
  selectedSegmentUsers: UserDto[] = [];
  selectedCity: | 'Cuenca' | 'Portoviejo' | null = null;

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
    private studentsService: StudentsService,
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
    this.router.navigate(['/dashboard/notifications-sent-v2']);
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
    this.selectedStageUsers = [];

    if (!stage?.id) {
      return;
    }

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'STUDENT',
        undefined,
        stage.id,
      )
      .subscribe({
        next: (response) => {
          this.selectedStageUsers =
            response.users ?? [];

          // console.log(
          //   'USUARIOS DEL STAGE:',
          //   this.selectedStageUsers,
          // );

          // console.log(
          //   'IDS DEL STAGE:',
          //   this.selectedStageUsers.map(
          //     user => user.id,
          //   ),
          // );
        },

        error: (error) => {
          console.error(
            'Error al obtener usuarios del stage:',
            error,
          );

          this.selectedStageUsers = [];
        },
      });
  }

  selectedRoleUsers: UserDto[] = [];

  handleRoleSelect(
    role: 'student' | 'instructor' | 'admin' | null,
  ): void {
    this.selectedRole = role;
    this.selectedRoleUsers = [];

    if (!role) {
      return;
    }

    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        role.toUpperCase(),
      )
      .subscribe({
        next: (response) => {
          this.selectedRoleUsers =
            response.users ?? [];

          // console.log(
          //   'USUARIOS DEL ROL:',
          //   this.selectedRoleUsers,
          // );

          // console.log(
          //   'IDS DEL ROL:',
          //   this.selectedRoleUsers.map(
          //     user => user.id,
          //   ),
          // );
        },

        error: (error) => {
          console.error(
            'Error al obtener usuarios por rol:',
            error,
          );

          this.selectedRoleUsers = [];
        },
      });
  }

  handleSegmentSelect(
    segment:
      | 'kids'
      | 'teens'
      | 'adults'
      | 'city'
      | null,
  ): void {
    this.selectedSegment = segment;
    this.selectedSegmentUsers = [];

    if (!segment) {
      return;
    }

    if (
      segment === 'kids' ||
      segment === 'teens' ||
      segment === 'adults'
    ) {
      const classification =
        segment.toUpperCase();

      this.studentsService
        .findStudents({
          classification,
        })
        .subscribe({
          next: (students) => {
            this.selectedSegmentUsers =
              students
                .map(student => student.user)
                .filter(
                  (user): user is UserDto =>
                    !!user?.id,
                );

            // console.log(
            //   'ESTUDIANTES DEL SEGMENTO:',
            //   students,
            // );

            // console.log(
            //   'USUARIOS DEL SEGMENTO:',
            //   this.selectedSegmentUsers,
            // );

            // console.log(
            //   'IDS DEL SEGMENTO:',
            //   this.selectedSegmentUsers.map(
            //     user => user.id,
            //   ),
            // );
          },

          error: (error) => {
            console.error(
              'Error al obtener estudiantes por segmento:',
              error,
            );

            this.selectedSegmentUsers = [];
          },
        });

      return;
    }
  }

  handleCitySelect(
    city: 'Cuenca' | 'Portoviejo' | null,
  ): void {
    this.selectedCity = city;
    this.selectedSegmentUsers = [];

    if (!city) {
      return;
    }

    this.studentsService
      .findStudents({
        city,
      })
      .subscribe({
        next: (students) => {
          this.selectedSegmentUsers =
            students
              .map(student => student.user)
              .filter(
                (user): user is UserDto =>
                  !!user?.id,
              );

          console.log(
            'USUARIOS DE LA CIUDAD:',
            this.selectedSegmentUsers,
          );

          console.log(
            'IDS DE LA CIUDAD:',
            this.selectedSegmentUsers.map(
              user => user.id,
            ),
          );
        },

        error: (error) => {
          console.error(
            'Error al obtener estudiantes por ciudad:',
            error,
          );

          this.selectedSegmentUsers = [];
        },
      });
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
    this.selectedStageUsers = [];
    this.selectedRole = null;
    this.selectedRoleUsers = [];
    this.selectedSegment = null;
    this.selectedSegmentUsers = [];
    this.selectedCity = null;

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
      this.selectedStageUsers = [];
    }

    if (option !== 'role') {
      this.selectedRole = null;
      this.selectedRoleUsers = [];
    }

    if (option !== 'group') {
      this.groups = [];
    }

    if (option === 'group') {
      this.loadGroups();
    }

    if (option !== 'segment') {
      this.selectedSegment = null;
      this.selectedSegmentUsers = [];
      this.selectedCity = null;
    }
  }



  /* =========================
     Validations
  ========================= */
  handleValidationRequested(): void {
    this.showValidationErrors = true;
  }

  private getSelectedRecipientIds(): number[] {
    switch (this.selectedAction) {

      case 'user':
        return this.selectedUser?.id
          ? [this.selectedUser.id]
          : [];

      case 'stage':
        return this.selectedStageUsers
          .map(user => user.id)
          .filter(
            (id): id is number =>
              typeof id === 'number',
          );

      case 'role':
        return this.selectedRoleUsers
          .map(user => user.id)
          .filter(
            (id): id is number =>
              typeof id === 'number',
          );

      case 'segment':
        return this.selectedSegmentUsers
          .map(user => user.id)
          .filter(
            (id): id is number =>
              typeof id === 'number',
          );

      default:
        return [];
    }
  }

  /* =========================
     SUBMIT
  ========================= */

 handleNotificationSubmit(
    payload: CreateNotificationDto,
  ): void {

    const recipientIds =
      Array.from(
        new Set(
          this.getSelectedRecipientIds(),
        ),
      );

    console.log(
      'DESTINATARIOS A ENVIAR:',
      recipientIds,
    );


    /* =========================
      VALIDAR DESTINATARIOS
    ========================= */

    if (recipientIds.length === 0) {
      this.submitFinished++;

      this.showModal({
        isError: true,
        title: 'Sin destinatarios',
        message:
          'No se encontró ningún usuario para enviar la notificación.',
      });

      return;
    }


    /* =========================
      PAYLOAD CON USUARIOS
    ========================= */

    const finalPayload: CreateNotificationDto = {
      ...payload,
      to: recipientIds,
      ...(this.selectedAction === 'segment' &&
      this.selectedSegment === 'city' &&
      this.selectedCity
        ? {
            city: this.selectedCity,
          }
        : {}),
    };

    // console.log(
    //   'PAYLOAD FINAL:',
    //   finalPayload,
    // );

    /* =========================
      STAGE / GROUP / ROLE /
      SEGMENT → BULK
    ========================= */

    if (
      this.selectedAction === 'stage' ||
      this.selectedAction === 'group' ||
      this.selectedAction === 'role' ||
      this.selectedAction === 'segment'
    ) {

      const bulkPayload: CreateNotificationsBulkDto = {
        notifications: [
          finalPayload,
        ],
      };

      console.log(
        'PAYLOAD BULK:',
        bulkPayload,
      );

      this.notificationService
        .createBulk(bulkPayload)
        .subscribe({

          next: () => {
            this.showValidationErrors = false;

            this.showModal({
              isSuccess: true,
              title: 'Notificación enviada',
              message:
                'La notificación fue enviada con éxito.',
            });

            this.clearSelection();
          },

          error: (err) => {
            console.error(
              'Error al enviar notificación bulk:',
              err,
            );

            this.submitFinished++;

            this.showModal({
              isError: true,
              title: 'Error al enviar',
              message:
                'Ocurrió un error al enviar la notificación.',
            });
          },

        });

      return;
    }


    /* =========================
      USER → CREATE
    ========================= */

    if (this.selectedAction === 'user') {

      this.notificationService
        .create(finalPayload)
        .subscribe({

          next: () => {
            this.showValidationErrors = false;

            this.showModal({
              isSuccess: true,
              title: 'Notificación enviada',
              message:
                'La notificación ha sido enviada con éxito.',
            });

            this.clearSelection();
          },

          error: (err) => {
            console.error(
              'Error al crear notificación:',
              err,
            );

            this.submitFinished++;

            this.showModal({
              isError: true,
              title: 'Error al enviar',
              message:
                'Ocurrió un error al enviar la notificación.',
            });
          },

        });

      return;
    }


    /* =========================
      FALLBACK
    ========================= */

    this.submitFinished++;

    this.showModal({
      isError: true,
      title: 'Error al enviar',
      message:
        'No se pudo determinar el tipo de envío de la notificación.',
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
