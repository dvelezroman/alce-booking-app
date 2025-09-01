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
import {
  CreateNotificationDto,
  NotificationGroupDto,
  NotificationScopeEnum,
  NotificationTypeEnum
} from '../../../services/dtos/notification.dto';
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
  @Input() selectedType: 'user' | 'stage' | 'group' | 'role' = 'user';
  @Input() stages: Stage[] = [];

  @Output() submitNotification = new EventEmitter<CreateNotificationDto>();

  @ViewChild('formRef') formRef!: NgForm;

  title = '';
  message = '';
  notificationType = NotificationTypeEnum.Announce;
  notificationTypes = Object.values(NotificationTypeEnum);
  userId: number | null = null;

  // USER 
  selectedUserRole: 'student' | 'instructor' = 'student';
  selectedUsers: UserDto[] = [];

  // STAGE
  selectedStageId: number | null = null;
  users: UserDto[] = [];
  totalUsersInStage = 0;

  // GROUP
  groups: NotificationGroupDto[] = [];
  selectedGroupId: number | null = null;
  selectedGroupMembers = 0;

  // ROLE 
  selectedBroadcastRole: '' | 'student' | 'instructor' | 'admin' = '';
  roleUsers: UserDto[] = [];
  totalUsersByRole = 0;

  // Prioridad
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
      if (user) this.userId = user.id;
    });

    if (this.selectedType === 'group') {
      this.notificationGroupService.getGroups().subscribe({
        next: (res) => {
          this.groups = res.notificationGroups || [];
          this.updateGroupMembers();
        },
        error: () => (this.groups = []),
      });
    }
  }

  onGroupChange(groupId: number | null) {
    this.selectedGroupId = groupId;
    this.updateGroupMembers();
  }

  private updateGroupMembers() {
    const g = this.groups.find(gr => gr.id === this.selectedGroupId);
    this.selectedGroupMembers = g?.userIds?.length ?? 0;
  }

  private getGroupUserIds(): number[] {
    const g = this.groups.find(gr => gr.id === this.selectedGroupId);
    return g?.userIds ?? [];
  }

  handleStageChange(stageId: number | null) {
    this.selectedStageId = stageId;
    this.selectedUsers = []; 
    if (stageId) this.fetchUsersByStage(stageId);
    else {
      this.users = [];
      this.totalUsersInStage = 0;
    }
  }

  fetchUsersByStage(stageId: number) {
    this.usersService
      .searchUsers(
        undefined, undefined, undefined,
        '', '', undefined,
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

  setBroadcastRole(role: '' | 'student' | 'instructor' | 'admin') {
    this.selectedBroadcastRole = role;

    if (!role) {
      this.roleUsers = [];
      this.totalUsersByRole = 0;
      return;
    }

    this.fetchUsersByRole(role);
  }

  private fetchUsersByRole(role: 'student' | 'instructor' | 'admin') {
    const roleParam = role.toUpperCase(); 
    this.usersService
      .searchUsers(
        undefined, undefined, undefined,
        '', '', undefined,
        roleParam,
        true,
        undefined
      )
      .subscribe({
        next: (res) => {
          this.roleUsers = res.users || [];
          this.totalUsersByRole = res.total || this.roleUsers.length;
        },
        error: () => {
          this.roleUsers = [];
          this.totalUsersByRole = 0;
        },
      });
  }

  handleUsersSelected(users: UserDto[]) {
    this.selectedUsers = users;
  }

  get titleText(): string {
    switch (this.selectedType) {
      case 'user':  return 'Nueva notificación a usuario(s)';
      case 'stage': return 'Nueva notificación por stage';
      case 'group': return 'Nueva notificación por grupo';
      case 'role':  return 'Nueva notificación por rol';
      default:      return 'Nueva notificación';
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
      case 'role':
        return 'Elige un rol y se enviará a todos los usuarios con ese rol.';
      default:
        return 'Envía notificaciones a usuarios, grupos, por etapa o por rol.';
    }
  }

  get recipientsCount(): number {
    if (this.selectedType === 'group') return this.selectedGroupMembers || 0;
    if (this.selectedType === 'stage') return this.totalUsersInStage || 0;
    if (this.selectedType === 'role')  return this.totalUsersByRole || 0;
    return this.selectedUsers.length || 0;
  }

  submitForm() {
    if (!this.formRef.valid || !this.userId) return;

    let to: number[] = [];
    let scope: NotificationScopeEnum;

    switch (this.selectedType) {
      case 'group': {
        to = this.getGroupUserIds();
        scope = NotificationScopeEnum.INDIVIDUAL; 
        if (!this.selectedGroupId || to.length === 0) return;
        break;
      }

      case 'stage': {
        to = (this.users ?? []).map(u => u.id);
        scope = NotificationScopeEnum.STAGE_STUDENTS;
        if (!this.selectedStageId || to.length === 0) return;
        break;
      }

      case 'role': {
        to = (this.roleUsers ?? []).map(u => u.id);
        scope = NotificationScopeEnum.INDIVIDUAL; 
        if (!this.selectedBroadcastRole || to.length === 0) return;
        break;
      }

      case 'user':
      default: {
        to = this.selectedUsers.map(u => u.id);
        scope = NotificationScopeEnum.INDIVIDUAL;
        if (to.length === 0) return;
        break;
      }
    }

    const stageId =
      this.selectedUserRole === 'student' && this.selectedStageId != null
        ? +this.selectedStageId
        : undefined;

    const payload: CreateNotificationDto = {
      from: this.userId!,
      to,
      scope,
      stageId,
      title: this.title,
      message: { body: this.message, action: 'join_meeting' },
      notificationType: this.notificationType,
      priority: this.priority,
      scheduledAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      metadata: { source: 'meeting_system', category: 'reminder' },
      maxRetries: 3,
    };

    this.submitNotification.emit(payload);
  }
}
