import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { StageSelectorComponent } from '../stage-selector/stage-selector.component';

import { Stage } from '../../../services/dtos/student.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { selectUserData } from '../../../store/user.selector';
import { CreateNotificationDto, NotificationGroupDto, NotificationScopeEnum, NotificationTypeEnum } from '../../../services/dtos/notification.dto';
import { NotificationGroupService } from '../../../services/notification-group.service';


@Component({
  selector: 'app-notification-form-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSelectorComponent,
    StageSelectorComponent,
  ],
  templateUrl: './notification-form-wrapper.component.html',
  styleUrl: './notification-form-wrapper.component.scss',
})
export class NotificationFormWrapperComponent implements OnInit {
  @Input() selectedType: 'user' | 'stage' | 'group' = 'user';
  @Input() stages: Stage[] = [];

  @Output() submitNotification = new EventEmitter<CreateNotificationDto>();

  @ViewChild('formRef') formRef!: NgForm;

  title = '';
  message = '';
  selectedUserRole: 'student' | 'instructor' = 'student';
  notificationType = NotificationTypeEnum.Announce;
  notificationTypes = Object.values(NotificationTypeEnum);
  selectedStageId: number | null = null;
  selectedUsers: UserDto[] = [];
  users: UserDto[] = [];
  totalUsersInStage: number = 0;
  groups: NotificationGroupDto[] = [];
  selectedGroupId: number | null = null;
  selectedGroupMembers = 0;

  userId: number | null = null;

  priority = 1; 
  priorityOptions = [
    { value: 0, label: 'Baja' },
    { value: 1, label: 'Normal' },
    { value: 2, label: 'Alta' },
    { value: 3, label: 'Urgente' },
  ];

  constructor(
    private usersService: UsersService,
    private notificationGroupService: NotificationGroupService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((user: UserDto | null) => {
      if (user) {
        this.userId = user.id;
      }
    });

    if (this.selectedType === 'group') {
      this.notificationGroupService.getGroups().subscribe({
        next: (res) => {
          this.groups = res.notificationGroups || [];
          this.updateGroupMembers();
        },
        error: () => {
          this.groups = [];
        }
      });
    }
  }

  onGroupChange(groupId: number | null) {
    this.selectedGroupId = groupId;
    this.updateGroupMembers();
  }

  // 👇 nuevo: calcula integrantes del grupo seleccionado
  private updateGroupMembers() {
    const g = this.groups.find(gr => gr.id === this.selectedGroupId);
    this.selectedGroupMembers = g?.userIds?.length ?? 0;
  }

  // 👇 nuevo: contador dinámico según el modo
  get recipientsCount(): number {
    if (this.selectedType === 'group') return this.selectedGroupMembers || 0;
    if (this.selectedType === 'stage') return this.totalUsersInStage || 0;
    return this.selectedUsers.length || 0;
  }

  get titleText(): string {
    switch (this.selectedType) {
      case 'user':
        return 'Nueva notificación a usuario(s)';
      case 'stage':
        return 'Nueva notificación por stage';
      case 'group':
        return 'Nueva notificación por grupo';
      default:
        return 'Nueva notificación';
    }
  }

  getFormSubtitle(): string {
    switch (this.selectedType) {
      case 'user':
        return 'Selecciona los usuarios a los que deseas enviar esta notificación.';
      case 'stage':
        return 'Selecciona una etapa y se notificará a todos los estudiantes dentro de ella.';
      case 'group':
        return 'Selecciona un grupo para enviar la notificación a sus integrantes.';
      default:
        return 'Envía notificaciones a usuarios, grupos o por etapa educativa.';
    }
  }

  handleUsersSelected(users: UserDto[]) {
    this.selectedUsers = users;
  }

  handleStageChange(stageId: number | null) {
    this.selectedStageId = stageId;

    if (stageId) {
      this.fetchUsersByStage(stageId);
    } else {
      this.users = [];
    }
  }

  fetchUsersByStage(stageId: number) {
    this.usersService
      .searchUsers(
        undefined,
        undefined,
        undefined,
        '',
        '',
        undefined,
        'STUDENT',
        true,
        stageId
      )
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.totalUsersInStage = res.total || res.users.length;
        },
        error: () => {
          this.users = [];
          this.totalUsersInStage = 0;
        },
      });
  }

  submitForm() {
    if (!this.formRef.valid || !this.userId) return;

    const to = this.selectedUsers.map((u) => u.id);
    let scope: NotificationScopeEnum;
    switch (this.selectedType) {
      case 'user':
        scope = NotificationScopeEnum.INDIVIDUAL;
        break;
      case 'stage':
        scope = NotificationScopeEnum.STAGE_STUDENTS;
        break;
      case 'group':
        scope = NotificationScopeEnum.ALL_USERS;
        break;
      default:
        scope = NotificationScopeEnum.INDIVIDUAL;
    }
    const stageId = this.selectedUserRole === 'student' && this.selectedStageId != null
      ? +this.selectedStageId
      : undefined;

    const payload = {
      from: this.userId,
      to,
      scope,
      stageId,
      title: this.title,
      message: {
        body: this.message,
        action: 'join_meeting',
      },
      notificationType: this.notificationType,
      priority: this.priority,
      scheduledAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      metadata: {
        source: 'meeting_system',
        category: 'reminder',
      },
      maxRetries: 3,
    };

    this.submitNotification.emit(payload);
  }
}