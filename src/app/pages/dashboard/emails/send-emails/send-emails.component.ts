import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { UserDto, UserRole } from '../../../../services/dtos/user.dto';
import { Stage } from '../../../../services/dtos/student.dto';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { selectUserData } from '../../../../store/user.selector';
import { UsersService } from '../../../../services/users.service';
import { StagesService } from '../../../../services/stages.service';
import { EmailPanelComponent } from '../../../../components/emails/email-panel/email-panel.component';
import { EmailFormWrapperComponent } from '../../../../components/emails/email-form-wrapper/email-form-wrapper.component';
import { NotificationGroupService } from '../../../../services/notification-group.service';
import { NotificationGroupDto } from '../../../../services/dtos/notification.dto';

// ⚡ DTO temporal, luego lo cambias por el real desde backend
export interface CreateEmailDto {
  to: (number | string)[];
  subject: string;
  body: string;
}

@Component({
  selector: 'app-send-emails',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    EmailPanelComponent,
    EmailFormWrapperComponent
  ],
  templateUrl: './send-emails.component.html',
  styleUrl: './send-emails.component.scss',
})
export class SendEmailsComponent implements OnInit {
  protected readonly UserRole = UserRole;

  selectedAction: 'user' | 'stage' | 'group' | 'role' | '' = '';
  selectedUser: any = null;
  selectedRole: 'student' | 'instructor' | 'admin' | null = null;
  userRole: UserRole | null = null;

  stages: Stage[] = [];
  selectedStage: Stage | null = null;

  groups: NotificationGroupDto[] = [];
  loadingGroups = false;
  
  modal: ModalDto = modalInitializer();
  resetChildren = false;

  constructor(
    private store: Store,
    private stagesService: StagesService,
    private usersService: UsersService,
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

  loadGroups() {
    this.loadingGroups = true;
    this.notificationGroupService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.notificationGroups || [];
        this.loadingGroups = false;
      },
      error: (err) => {
        console.error('Error al obtener grupos', err);
        this.groups = [];
        this.loadingGroups = false;
      },
    });
  }

  handleUserSelect(user: UserDto | null) { this.selectedUser = user; }
  handleStageSelect(stage: Stage | null) { this.selectedStage = stage; }

  private clearSelection(): void {
    this.selectedAction = '';
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
    if (option === 'group') { this.loadGroups() }
  }

  handleEmailSubmit(payload: CreateEmailDto): void {
    console.log('📧 Email payload listo para enviar:', payload);

    if (!payload.to || payload.to.length === 0) {
      this.showModal({
        isError: true,
        title: 'Sin destinatarios',
        message: 'Debes seleccionar al menos un destinatario o ingresar un correo válido.',
      });
      return;
    }

    this.showModal({
      isSuccess: true,
      title: 'Email preparado',
      message: 'Se simuló el envío correctamente (console.log).',
    });

    this.clearSelection();
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