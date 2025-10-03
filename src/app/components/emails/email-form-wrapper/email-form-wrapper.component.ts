import {
  Component,
  Input,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
import {
  SendEmailRequest,
  SendBulkEmailRequest,
  BulkEmailRecipient,
  SendTemplateEmailRequest,
} from '../../../services/dtos/email.dto';

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
export class EmailFormWrapperComponent implements OnInit, OnChanges {
  @Input() selectedType: 'user' | 'stage' | 'group' | 'role' = 'user';
  @Input() stages: Stage[] = [];
  @Input() userRole: UserRole | null = null;
  @Input() groups: NotificationGroupDto[] = [];
  protected readonly UserRole = UserRole;

  @Output() submitEmail = new EventEmitter<SendBulkEmailRequest>();
  @Output() submitSingleEmail = new EventEmitter<SendEmailRequest>();
  @Output() submitTemplateEmail = new EventEmitter<SendTemplateEmailRequest>();
  @Output() invalidSingleEmail = new EventEmitter<UserDto>();


  @ViewChild('formRef') formRef!: NgForm;

  // NUEVO: modo de envío
  sendMode: 'manual' | 'template' = 'manual';

  // Campos para envío manual
  subject = '';
  body = '';

  // Campos para plantillas
  templateName = '';
  templateVarsText = '';

  // Mock de plantillas disponibles
  templates = [
    {
      "name": "welcome",
      "displayName": "Welcome to ALCE College",
      "variables": ["nombre", "curso"]
    },
    {
      "name": "class-notice",
      "displayName": "Aviso de clases",
      "variables": ["fecha", "hora"]
    },
    {
      "name": "payment-reminder",
      "displayName": "Recordatorio de pago",
      "variables": [ "monto", "fechaVencimiento"]
    }
  ]

  userId: number | null = null;
  manualEmailError = '';

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

  constructor(private store: Store, private usersService: UsersService) {}

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedType'] && !changes['selectedType'].firstChange) {
      this.resetForm();
    }
  }

  resetForm() {
    this.subject = '';
    this.body = '';
    this.templateName = '';
    this.templateVarsText = '';
    this.manualMode = false;
    this.manualEmail = '';
    this.manualEmailError = '';
    this.selectedUsers = [];
    this.selectedStageId = null;
    this.selectedBroadcastRole = '';
    this.roleUsers = [];
    this.totalUsersByRole = 0;
    this.users = [];
    this.totalUsersInStage = 0;
    this.selectedGroupId = null;
    this.selectedGroupMembers = 0;
    this.sendMode = 'manual';

    if (this.formRef) {
      this.formRef.resetForm();
    }
  }

  // helpers
  get isUserMode(): boolean {
    return this.selectedType === 'user';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private getUserEmailByRole(u: UserDto): string | null {
    if (!u) return null;
    
    // Try emailAddress first, fallback to email if emailAddress is not valid
    if (u.emailAddress && this.isValidEmail(u.emailAddress)) {
      return u.emailAddress;
    }
    
    // Fallback to email field if emailAddress is not valid or fails
    if (u.email && this.isValidEmail(u.email)) {
      return u.email;
    }
    
    return null;
  }

  private getSelectedSingleEmail(): string | null {
    if (this.manualMode) {
      const e = (this.manualEmail || '').trim();
      return e && this.isValidEmail(e) ? e : null;
    }
    const u = this.selectedUsers[0];
    return this.getUserEmailByRole(u) ?? null;
  }

  canSubmitForSelectedType(): boolean {
    if (this.sendMode === 'manual') {
      if (!this.subject || !this.body) return false;
      if (this.isUserMode) {
        return !!this.getSelectedSingleEmail();
      }
      return this.recipientsCount > 0;
    } else {
      return !!this.templateName;
    }
  }

  // Stage
  handleStageChange(stageId: number | null) {
    this.selectedStageId = stageId;
    this.selectedUsers = [];
    if (stageId) this.fetchUsersByStage(stageId);
    else {
      this.users = [];
      this.totalUsersInStage = 0;
    }
  }

  onGroupChange(groupId: number | string | null) {
    this.selectedGroupId = groupId != null ? +groupId : null;
    this.updateGroupMembers();
  }

  private updateGroupMembers() {
    const g = this.groups.find((gr) => gr.id === this.selectedGroupId);
    const total = g?.users?.length ?? g?.userIds?.length ?? 0;
    this.selectedGroupMembers = total;
  }

  onManualModeChange(value: boolean) {
    this.manualMode = value;
    if (!value) {
      this.manualEmail = '';
      this.manualEmailError = '';
    }
  }

  onTemplateChange(templateName: string) {
    const selected = this.templates.find(t => t.name === templateName);
    if (selected && selected.variables) {
      const varsObj: any = {};
      selected.variables.forEach(v => varsObj[v] = "");
      this.templateVarsText = JSON.stringify(varsObj, null, 2);
    } else {
      this.templateVarsText = "{}";
    }
  }

  onSendModeChange(mode: 'manual' | 'template') {
    this.sendMode = mode;

    if (mode === 'manual') {
      this.templateName = '';
      this.templateVarsText = '';
    }
  }

  validateManualEmail() {
    if (!this.manualMode) return;
    const email = (this.manualEmail || '').trim();
    if (!email) {
      this.manualEmailError = '';
      return;
    }
    this.manualEmailError = this.isValidEmail(email)
      ? ''
      : 'Correo inválido, revisa el formato';
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
        undefined,
        undefined,
        undefined,
        '',
        '',
        undefined,
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
    this.selectedUsers = this.isUserMode ? users.slice(0, 1) : users;
  }

  get titleText(): string {
    switch (this.selectedType) {
      case 'user':
        return 'Nuevo email a usuario';
      case 'stage':
        return 'Nuevo email por stage';
      case 'role':
        return 'Nuevo email por rol';
      case 'group':
        return 'Nuevo email por grupo';
      default:
        return 'Nuevo email';
    }
  }

  get recipientsCount(): number {
    if (this.isUserMode) {
      return this.getSelectedSingleEmail() ? 1 : 0;
    }
    if (this.selectedType === 'stage') {
      return (this.users ?? []).filter((u) => this.getUserEmailByRole(u)).length;
    }
    if (this.selectedType === 'role') {
      return (this.roleUsers ?? []).filter((u) =>
        this.getUserEmailByRole(u)
      ).length;
    }
    if (this.selectedType === 'group') {
      const g = this.groups.find((gr) => gr.id === this.selectedGroupId);
      return g?.users?.filter((u) => this.getUserEmailByRole(u)).length ?? 0;
    }
    return this.selectedUsers.filter((u) => this.getUserEmailByRole(u)).length;
  }

  get invalidUsers(): UserDto[] {
    let users: UserDto[] = [];

    if (this.selectedType === 'stage') {
      users = this.users ?? [];
    } else if (this.selectedType === 'role') {
      users = this.roleUsers ?? [];
    } else if (this.selectedType === 'group') {
      const g = this.groups.find((gr) => gr.id === this.selectedGroupId);
      users = g?.users ?? [];
    } else if (this.isUserMode) {
      users = this.selectedUsers ?? [];
    }

    return users.filter((u) => !this.getUserEmailByRole(u));
  }

  submitForm() {
    if (!this.formRef.valid || !this.userId) return;

    //  Caso especial: envío con plantilla
    if (this.sendMode === 'template') {
      const to = this.getSelectedSingleEmail();
      if (!to || !this.templateName) return;

      let variables: Record<string, string> = {};
      try {
        variables = this.templateVarsText ? JSON.parse(this.templateVarsText) : {};
      } catch {
        alert('Formato inválido en variables (JSON requerido)');
        return;
      }

      const templatePayload: SendTemplateEmailRequest = {
        to,
        templateName: this.templateName,
        variables,
        fromName: 'ALCE College',
        replyTo: 'noreply@alce-college.com',
      };

      this.submitTemplateEmail.emit(templatePayload);
      return;
    }

    //  Caso 1: individual (manual clásico)
    if (this.isUserMode) {
      const singleUser = this.selectedUsers[0];
      const singleTo = this.getSelectedSingleEmail();

      if (!singleTo) {
        this.invalidSingleEmail.emit(singleUser);
        return;
      }

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

    //  Caso 2: stage / role / group (bulk)
    let recipients: BulkEmailRecipient[] = [];

    switch (this.selectedType) {
      case 'stage': {
        recipients = (this.users ?? [])
          .map(u => {
            const email = this.getUserEmailByRole(u);
            return email ? { to: email, name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() } : null;
          })
          .filter((r): r is BulkEmailRecipient => !!r);
        break;
      }
      case 'role': {
        recipients = (this.roleUsers ?? [])
          .map(u => {
            const email = this.getUserEmailByRole(u);
            return email ? { to: email, name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() } : null;
          })
          .filter((r): r is BulkEmailRecipient => !!r);
        break;
      }
      case 'group': {
        const g = this.groups.find(gr => gr.id === this.selectedGroupId);
        recipients = g?.users?.map(u => {
          const email = this.getUserEmailByRole(u);
          return email ? { to: email, name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() } : null;
        }).filter((r): r is BulkEmailRecipient => !!r) ?? [];
        break;
      }
      default:
        return;
    }

    if (recipients.length === 0) return;

    const bulkPayload: SendBulkEmailRequest = {
      recipients,
      subject: this.subject,
      content: this.body,
      contentType: 'html',
      fromName: 'ALCE College',
      replyTo: 'noreply@alce-college.com',
    };

    this.submitEmail.emit(bulkPayload);
  }
}