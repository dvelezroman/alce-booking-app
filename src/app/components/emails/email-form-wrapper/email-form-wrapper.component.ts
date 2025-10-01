import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Stage } from '../../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { selectUserData } from '../../../store/user.selector';
import { UserSelectorComponent } from '../../notifications/user-selector/user-selector.component';
import { StageSelectorComponent } from '../../notifications/stage-selector/stage-selector.component';
import { NotificationGroupDto } from '../../../services/dtos/notification.dto';

export interface CreateEmailDto {
  from: number;
  to: number[];
  scope: string;
  stageId?: number;
  subject: string;
  body: string;
  metadata?: any;
}

@Component({
  selector: 'app-email-form-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSelectorComponent,
    StageSelectorComponent,
  ],
  templateUrl: './email-form-wrapper.component.html',
  styleUrl: './email-form-wrapper.component.scss',
})
export class EmailFormWrapperComponent implements OnInit {
  @Input() selectedType: 'user' | 'stage' | 'group' | 'role' = 'user';
  @Input() stages: Stage[] = [];
  @Input() userRole: UserRole | null = null;
  @Input() groups: NotificationGroupDto[] = [];
  protected readonly UserRole = UserRole;

  @Output() submitEmail = new EventEmitter<CreateEmailDto>();

  @ViewChild('formRef') formRef!: NgForm;

  subject = '';
  body = '';
  userId: number | null = null;

  // USER
  selectedUserRole: 'student' | 'instructor' | 'admin' = 'student';
  selectedUsers: UserDto[] = [];

  // STAGE
  selectedStageId: number | null = null;
  users: UserDto[] = [];
  totalUsersInStage = 0;

  // ROLE
  selectedBroadcastRole: '' | 'student' | 'instructor' | 'admin' = '';
  roleUsers: UserDto[] = [];
  totalUsersByRole = 0;

  // GROUP
  selectedGroupId: number | null = null;
  selectedGroupMembers = 0;

  constructor(
    private store: Store,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((user: UserDto | null) => {
      if (user) {
        this.userId = user.id;
        if (this.userRole === UserRole.STUDENT) {
          this.selectedUserRole = 'instructor';
        }
      }
    });
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

  onGroupChange(groupId: number | null) {
    this.selectedGroupId = groupId;
    this.updateGroupMembers();
  }

  private updateGroupMembers() {
    const g = this.groups.find(gr => gr.id === this.selectedGroupId);
    this.selectedGroupMembers = g?.userIds?.length ?? 0;
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

  onUserRoleChange(next: 'student' | 'instructor' | 'admin') {
    this.selectedUserRole = next;
    this.selectedUsers = [];
  }

  handleUsersSelected(users: UserDto[]) {
    this.selectedUsers = users;
  }

  get titleText(): string {
    switch (this.selectedType) {
      case 'user':  return 'Nuevo email a usuario(s)';
      case 'stage': return 'Nuevo email por stage';
      case 'role':  return 'Nuevo email por rol';
      case 'group': return 'Nuevo email por grupo';
      default:      return 'Nuevo email';
    }
  }

  get recipientsCount(): number {
    if (this.selectedType === 'stage') return this.totalUsersInStage || 0;
    if (this.selectedType === 'role')  return this.totalUsersByRole || 0;
    if (this.selectedType === 'group') return this.selectedGroupId || 0;
    return this.selectedUsers.length || 0;
  }

  submitForm() {
    if (!this.formRef.valid || !this.userId) return;

    let to: number[] = [];
    let scope: string;

    switch (this.selectedType) {
      case 'stage': {
        to = (this.users ?? []).map(u => u.id);
        scope = 'STAGE';
        if (!this.selectedStageId || to.length === 0) return;
        break;
      }

      case 'role': {
        to = (this.roleUsers ?? []).map(u => u.id);
        if (!this.selectedBroadcastRole || to.length === 0) return;
        scope = `ROLE_${this.selectedBroadcastRole.toUpperCase()}`;
        break;
      }

      case 'group': {
        scope = 'GROUP';
        if (!this.selectedGroupId) return;
        break;
      }

      case 'user':
      default: {
        to = this.selectedUsers.map(u => u.id);
        scope = 'INDIVIDUAL';
        if (to.length === 0) return;
        break;
      }
    }

    const stageId =
      this.selectedUserRole === 'student' && this.selectedStageId != null
        ? +this.selectedStageId
        : undefined;

    const payload: CreateEmailDto = {
      from: this.userId!,
      to,
      scope,
      stageId,
      subject: this.subject,
      body: this.body,
      metadata: { source: 'email_system' },
      ...(this.selectedGroupId ? { groupId: this.selectedGroupId } : {}),
    };

    console.log('Email payload listo:', payload);
    this.submitEmail.emit(payload);
  }
}