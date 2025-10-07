import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { UserDto, UserRole } from '../../../../services/dtos/user.dto';
import { Stage } from '../../../../services/dtos/student.dto';
import { NotificationPanelComponent } from '../../../../components/notifications/notification-panel/notification-panel.component';
import { StagesService } from '../../../../services/stages.service';
import { CreateNotificationDto, NotificationGroupDto } from '../../../../services/dtos/notification.dto';
import { NotificationService } from '../../../../services/notification.service';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { selectUserData } from '../../../../store/user.selector';
import { UsersService } from '../../../../services/users.service';
import { NotificationGroupService } from '../../../../services/notification-group.service';
import { NotificationFormWrapperComponent } from '../../../../components/notifications/notification-form-wrapper/notification-form-wrapper.component';

@Component({
  selector: 'app-broadcast-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationPanelComponent,
    NotificationFormWrapperComponent,
    ModalComponent,
  ],
  templateUrl: './broadcast-groups.component.html',
  styleUrl: './broadcast-groups.component.scss',
})
export class BroadcastGroupsComponent implements OnInit {
  protected readonly UserRole = UserRole;

  selectedAction: 'user' | 'stage' | 'group' | 'role' | '' = '';
  selectedUser: any = null;
  selectedRole: 'student' | 'instructor' | 'admin' | null = null;
  stages: Stage[] = [];
  selectedStage: Stage | null = null;
  modal: ModalDto = modalInitializer();
  resetChildren = false;
  userRole: UserRole | null = null;

  groups: NotificationGroupDto[] = [];
  loadingGroups = false;

  constructor(
    private store: Store,
    private stagesService: StagesService,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private notificationGroupService: NotificationGroupService
  ) {}

  ngOnInit() {
    this.store.select(selectUserData).pipe(take(1)).subscribe((u: UserDto | null) => {
      if (u?.role) {
        this.userRole = u.role;
      } else {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
          this.usersService.refreshLogin().subscribe({
            next: (resp) => { this.userRole = resp.role ?? null; },
            error: () =>   { this.userRole = null; }
          });
        } else {
          this.userRole = null;
        }
      }
    });

    this.stagesService.getAll().subscribe((response: Stage[]) => {
      this.stages = response
        .filter((s) => {
          const match = s.description.match(/stage\s+(\d+)/i);
          if (!match) return false;
          const num = +match[1];
          return num >= 1 && num <= 19;
        })
        .sort((a, b) => {
          const aNum = +(a.description.match(/stage\s+(\d+)/i)?.[1] || 0);
          const bNum = +(b.description.match(/stage\s+(\d+)/i)?.[1] || 0);
          return aNum - bNum;
        });
    });
  }

  private loadGroups() {
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
      }
    });
  }

  handleUserSelect(user: UserDto | null) { this.selectedUser = user; }
  handleStageSelect(stage: Stage | null) { this.selectedStage = stage; }

  private clearSelection(): void {
    this.selectedUser = null;
    this.selectedStage = null;
    this.selectedRole = null;
    this.resetChildren = true;
    setTimeout(() => { this.resetChildren = false; }, 0);
  }

  onSendOptionSelected(option: 'user' | 'stage' | 'group' | 'role') {
    this.selectedAction = option;
    if (option !== 'user')  this.selectedUser  = null;
    if (option !== 'stage') this.selectedStage = null;
    if (option !== 'role')  this.selectedRole  = null;
    if (option === 'group') {
      this.loadGroups();
    }
  }

  handleNotificationSubmit(payload: CreateNotificationDto): void {
    const ids = Array.isArray(payload.to)
      ? Array.from(new Set(payload.to.filter((x): x is number => typeof x === 'number')))
      : [];

    if (ids.length === 0) {
      this.showModal({
        isError: true,
        title: 'Sin destinatarios',
        message: 'No se encontró ningún usuario para enviar la notificación.',
      });
      return;
    }

    const finalPayload: CreateNotificationDto = { ...payload, to: ids };

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

  private showModal({ title = '', message = '', isSuccess = false, isError = false , duration = 2000 }: {
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
    setTimeout(() => { this.modal.show = false; }, duration);
  }
}