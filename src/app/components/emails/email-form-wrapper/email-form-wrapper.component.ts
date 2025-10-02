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
import { SendEmailRequest } from '../../../services/dtos/email.dto';

export interface CreateEmailDto {
  from: number;
  to: string[];
  scope: string;
  stageId?: number;
  subject: string;
  body: string;
  metadata?: any;
  priority?: number;
  groupId?: number;
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
  @Output() submitSingleEmail = new EventEmitter<SendEmailRequest>();

  @ViewChild('formRef') formRef!: NgForm;

  subject = '';
  body = '';
  userId: number | null = null;

  // USER
  selectedUserRole: 'student' | 'instructor' | 'admin' = 'student';
  selectedUsers: UserDto[] = [];
  manualMode = false;
  manualEmail = '';

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

  // PRIORIDAD
  priority = 1;
  priorityOptions = [
    { value: 0, label: 'Baja' },
    { value: 1, label: 'Normal' },
    { value: 2, label: 'Alta' },
    { value: 3, label: 'Urgente' },
  ];

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

  // helpers
  get isUserMode(): boolean {
    return this.selectedType === 'user';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private getSelectedSingleEmail(): string | null {
    if (this.manualMode) {
      const e = (this.manualEmail || '').trim();
      return e && this.isValidEmail(e) ? e : null;
    }
    const u = this.selectedUsers[0];
    const email = u?.emailAddress || u?.email || '';
    return email && this.isValidEmail(email) ? email : null;
  }

  canSubmitForSelectedType(): boolean {
    if (!this.subject || !this.body) return false;
    if (this.isUserMode) {
      return !!this.getSelectedSingleEmail();
    }
    return this.recipientsCount > 0;
  }

  // --- STAGE
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

  onManualModeChange(value: boolean) {
    this.manualMode = value;
    if (!value) {
      this.manualEmail = '';
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
      .searchUsers(undefined, undefined, undefined, '', '', undefined, roleParam, true, undefined)
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
    this.selectedUsers = this.isUserMode ? users.slice(0, 1) : users;
  }

  get titleText(): string {
    switch (this.selectedType) {
      case 'user':  return 'Nuevo email a usuario';
      case 'stage': return 'Nuevo email por stage';
      case 'role':  return 'Nuevo email por rol';
      case 'group': return 'Nuevo email por grupo';
      default:      return 'Nuevo email';
    }
  }

  get recipientsCount(): number {
    if (this.isUserMode) {
      return this.getSelectedSingleEmail() ? 1 : 0;
    }
    if (this.selectedType === 'stage') return this.totalUsersInStage || 0;
    if (this.selectedType === 'role')  return this.totalUsersByRole || 0;
    if (this.selectedType === 'group') return this.selectedGroupMembers || 0;
    return this.selectedUsers.length || 0;
  }

  submitForm() {
    if (!this.formRef.valid || !this.userId) return;

    // Caso 1: individual
    if (this.isUserMode) {
      const singleTo = this.getSelectedSingleEmail();
      if (!singleTo) return;

      const singlePayload: SendEmailRequest = {
        to: singleTo,
        subject: this.subject,
        content: this.body,
        contentType: 'html',
        fromName: 'ALCE College',
        replyTo: 'noreply@alce-college.com',
      };

      this.submitSingleEmail.emit(singlePayload);
      return;
    }

    // Caso 2: stage / role / group
    let to: string[] = [];
    let scope: string;

    switch (this.selectedType) {
      case 'stage': {
        to = (this.users ?? []).map(u => u.emailAddress || u.email).filter((e): e is string => !!e);
        scope = 'STAGE';
        if (!this.selectedStageId || to.length === 0) return;
        break;
      }
      case 'role': {
        to = (this.roleUsers ?? []).map(u => u.emailAddress || u.email).filter((e): e is string => !!e);
        if (!this.selectedBroadcastRole || to.length === 0) return;
        scope = `ROLE_${this.selectedBroadcastRole.toUpperCase()}`;
        break;
      }
      case 'group': {
        const g = this.groups.find(gr => gr.id === this.selectedGroupId);
        to = g?.users?.map(u => u.emailAddress || u.email).filter((e): e is string => !!e) ?? [];
        scope = 'GROUP';
        if (!this.selectedGroupId || to.length === 0) return;
        break;
      }
      default:
        return;
    }

    const stageId = this.selectedUserRole === 'student' && this.selectedStageId != null ? +this.selectedStageId : undefined;

    const payload: CreateEmailDto = {
      from: this.userId!,
      to,
      scope,
      stageId,
      subject: this.subject,
      body: this.body,
      priority: this.priority,
      metadata: { source: 'email_system' },
      ...(this.selectedGroupId ? { groupId: this.selectedGroupId } : {}),
    };

    this.submitEmail.emit(payload);
  }
}