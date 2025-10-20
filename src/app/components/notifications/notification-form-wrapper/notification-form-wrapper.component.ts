import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { StageSelectorComponent } from '../stage-selector/stage-selector.component';

import { Stage } from '../../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';
import { UsersService } from '../../../services/users.service';
import { selectUserData } from '../../../store/user.selector';
import {
  CreateNotificationDto,
  NotificationGroupDto,
  NotificationScopeEnum,
  NotificationTypeEnum
} from '../../../services/dtos/notification.dto';

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
  @Input() userRole: UserRole | null = null;
  @Input() groups: NotificationGroupDto[] = [];

  protected readonly UserRole = UserRole;

  @Output() submitNotification = new EventEmitter<CreateNotificationDto>();
  @ViewChild('formRef') formRef!: NgForm;

  title = '';
  message = '';
  notificationType = NotificationTypeEnum.Announce;
  notificationTypes = Object.values(NotificationTypeEnum);
  userId: number | null = null;

  // USER
  selectedUserRole: 'student' | 'instructor' | 'admin' = 'student';
  selectedUsers: UserDto[] = [];

  // STAGE
  selectedStageId: number | null = null;
  users: UserDto[] = [];
  totalUsersInStage = 0;

  // GROUP
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

  showScheduleInputs = false;
  scheduledAtLocal = '';
  expiresAtLocal = '';
  datesInvalid = false;
  userResetTick = 0;

  noExpire = false;

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

    const now = new Date();
    this.scheduledAtLocal = this.toLocalInput(now);

    const defaultExpire = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    this.expiresAtLocal = this.toLocalInput(defaultExpire);
  }

  private toLocalInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  onScheduledChange(val: string) {
    this.scheduledAtLocal = val;
    const sched = new Date(val);
    const exp = new Date(this.expiresAtLocal);
    // Si no hay expiración o la actual es anterior, poner 1 día después
    if (!this.expiresAtLocal || exp <= sched) {
      const e = new Date(sched.getTime() + 24 * 60 * 60 * 1000);
      this.expiresAtLocal = this.toLocalInput(e);
    }
    this.validateDates();
  }

  onExpiresChange(val: string) {
    this.expiresAtLocal = val;
    this.validateDates();
  }

  private validateDates() {
    if (this.noExpire) {
      this.datesInvalid = false;
      return;
    }
    const sched = new Date(this.scheduledAtLocal);
    const exp = new Date(this.expiresAtLocal);
    this.datesInvalid = isNaN(+sched) || isNaN(+exp) || exp <= sched;
  }

  onNoExpireToggle(val: boolean) {
    this.noExpire = val;
    if (val) {
      this.expiresAtLocal = '';
      this.datesInvalid = false;
    } else if (this.scheduledAtLocal && !this.expiresAtLocal) {
      // Si se desmarca, establecer por defecto 1 día después
      const sched = new Date(this.scheduledAtLocal);
      const e = new Date(sched.getTime() + 24 * 60 * 60 * 1000);
      this.expiresAtLocal = this.toLocalInput(e);
    }
  }

  onUserRoleChange(next: 'student' | 'instructor' | 'admin') {
    this.selectedUserRole = next;
    this.selectedUsers = [];
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
      .searchUsers(undefined, undefined, undefined, '', '', undefined, 'STUDENT', true, stageId)
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
      case 'user':  return 'Selecciona los usuarios a los que deseas enviar esta notificación.';
      case 'stage': return 'Selecciona una etapa y se notificará a todos los estudiantes dentro de ella.';
      case 'group': return 'Selecciona un grupo para enviar la notificación a sus integrantes.';
      case 'role':  return 'Elige un rol y se enviará a todos los usuarios con ese rol.';
      default:      return 'Envía notificaciones a usuarios, grupos, por etapa o por rol.';
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

    // Variables base: destinatarios (to) y alcance (scope)
    let to: number[] = [];
    let scope: NotificationScopeEnum;

    // Determina el tipo de notificación según "selectedType"
    // y construye la lista de destinatarios "to" según el caso.
    switch (this.selectedType) {
      case 'group': {
        //  Enviar a un grupo: obtiene los IDs de usuarios del grupo
        to = this.getGroupUserIds();
        scope = NotificationScopeEnum.INDIVIDUAL;
        if (!this.selectedGroupId || to.length === 0) return;
        break;
      }

      case 'stage': {
        // Enviar por stage (etapa): obtiene los usuarios del stage seleccionado
        to = (this.users ?? []).map(u => u.id);
        scope = NotificationScopeEnum.STAGE_STUDENTS;
        if (!this.selectedStageId || to.length === 0) return;
        break;
      }

      case 'role': {
        // Enviar por rol: obtiene los usuarios con el rol elegido
        to = (this.roleUsers ?? []).map(u => u.id);
        if (!this.selectedBroadcastRole || to.length === 0) return;

        // Define el alcance del envío según el rol seleccionado
        scope =
          this.selectedBroadcastRole === 'student'
            ? NotificationScopeEnum.ALL_STUDENTS
            : this.selectedBroadcastRole === 'instructor'
            ? NotificationScopeEnum.ALL_INSTRUCTORS
            : NotificationScopeEnum.INDIVIDUAL;
        break;
      }

      case 'user':
      default: {
        // Enviar a usuarios específicos (seleccionados manualmente)
        to = this.selectedUsers.map(u => u.id);
        scope = NotificationScopeEnum.INDIVIDUAL;
        if (to.length === 0) return;
        break;
      }
    }

    // Determina el stage (solo si aplica a estudiantes)
    const stageId =
      this.selectedUserRole === 'student' && this.selectedStageId != null
        ? +this.selectedStageId
        : undefined;

    // Convierte la fecha programada local en ISO (UTC)
    const scheduledDate = this.scheduledAtLocal
      ? new Date(this.scheduledAtLocal)
      : new Date();
    const scheduledAtISO = scheduledDate.toISOString();

    // Calcula la fecha de expiración según el estado del checkbox “No expira”
    let expiresAtISO: string | undefined;

    if (this.noExpire) {
      // Si “No expira” → no se envía fecha de expiración
      expiresAtISO = undefined;
    } else if (this.expiresAtLocal && this.expiresAtLocal.trim()) {
      // Si el usuario eligió manualmente una fecha → se usa tal cual
      expiresAtISO = new Date(this.expiresAtLocal).toISOString();
    } else {
      // Si no eligió fecha → se pone automáticamente un día después
      const exp = new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000);
      expiresAtISO = exp.toISOString();
    }

    // Flags de persistencia: controlan si la notificación se puede borrar
    const isPersistent = this.noExpire;
    const isDeletable = !this.noExpire;

    // Construye el payload final con toda la información
    const payload: CreateNotificationDto = {
      from: this.userId!,
      to,
      scope,
      stageId,
      title: this.title,
      message: {
        body: this.message,
        action: 'join_meeting'
      },
      notificationType: this.notificationType,
      priority: this.priority,
      scheduledAt: scheduledAtISO,
      expiresAt: expiresAtISO,
      metadata: {
        source: 'meeting_system',
        category: 'reminder'
      },
      maxRetries: 3,
      isTemporal: false,
      temporalWindowType: 'FIXED_DAYS',
      temporalWindowValue: 7,
      temporalWindowStart: scheduledAtISO,
      temporalWindowEnd: expiresAtISO
        ? new Date(new Date(expiresAtISO).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      temporalStageId: stageId,
      isPersistent,
      isDeletable
    };

    // Emite el evento hacia el componente padre para que lo envíe al backend
    this.submitNotification.emit(payload);

    // Limpia los campos del formulario tras enviar
    this.expiresAtLocal = '';
    this.datesInvalid = false;
    this.title = '';
    this.message = '';

    // Reinicia selección de usuarios si el tipo es “user”
    if (this.selectedType === 'user') {
      this.selectedUsers = [];
      this.userResetTick++;
    }
  }
}