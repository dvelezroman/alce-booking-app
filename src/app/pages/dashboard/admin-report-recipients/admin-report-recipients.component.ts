import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminReportRecipient,
  AdminReportRecipientsService,
} from '../../../services/admin-report-recipients.service';
import { UserSelectorComponent } from '../../../components/notifications/user-selector/user-selector.component';
import { UserDto } from '../../../services/dtos/user.dto';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-admin-report-recipients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserSelectorComponent,
    ModalComponent,
  ],
  templateUrl: './admin-report-recipients.component.html',
  styleUrl: './admin-report-recipients.component.scss',
})
export class AdminReportRecipientsComponent implements OnInit {
  items: AdminReportRecipient[] = [];
  loading = false;
  saving = false;
  errorMsg = '';

  selectedAdmins: UserDto[] = [];
  userSelectorReset = 0;

  externalEmail = '';
  externalDisplayName = '';

  modal: ModalDto = modalInitializer();
  pendingRemove: AdminReportRecipient | null = null;

  constructor(
    private readonly adminReportRecipientsService: AdminReportRecipientsService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminReportRecipientsService.list().subscribe({
      next: (items) => {
        this.items = items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('[AdminReportRecipients]', err);
        this.errorMsg = 'No se pudo cargar la lista de destinatarios.';
        this.loading = false;
      },
    });
  }

  onUsersSelected(users: UserDto[]): void {
    this.selectedAdmins = users || [];
  }

  addSelectedAdmins(): void {
    const ids = this.selectedAdmins
      .map((u) => u.id)
      .filter((id): id is number => typeof id === 'number');
    if (!ids.length || this.saving) return;

    this.saving = true;
    this.adminReportRecipientsService.addUsers(ids).subscribe({
      next: () => {
        this.saving = false;
        this.selectedAdmins = [];
        this.userSelectorReset += 1;
        this.showSuccess('Administradores añadidos a la lista.');
        this.fetch();
      },
      error: (err) => {
        this.saving = false;
        console.error('[AdminReportRecipients] addUsers', err);
        this.showError(
          err?.error?.message ||
            'No se pudieron añadir los administradores seleccionados.',
        );
      },
    });
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  addExternal(): void {
    const email = this.externalEmail.trim().toLowerCase();
    if (!this.isValidEmail(email) || this.saving) return;

    this.saving = true;
    this.adminReportRecipientsService
      .addExternal(email, this.externalDisplayName.trim() || undefined)
      .subscribe({
        next: () => {
          this.saving = false;
          this.externalEmail = '';
          this.externalDisplayName = '';
          this.showSuccess('Correo externo añadido a la lista.');
          this.fetch();
        },
        error: (err) => {
          this.saving = false;
          console.error('[AdminReportRecipients] addExternal', err);
          this.showError(
            err?.error?.message || 'No se pudo añadir el correo externo.',
          );
        },
      });
  }

  confirmRemove(item: AdminReportRecipient): void {
    this.pendingRemove = item;
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Quitar destinatario',
      message: `¿Quitar <strong>${item.email}</strong> de los reportes y notificaciones?`,
      showButtons: true,
      isInfo: true,
      confirm: () => {
        this.modal.show = false;
        this.removeConfirmed();
      },
      close: () => {
        this.pendingRemove = null;
        this.modal.show = false;
      },
    };
  }

  private removeConfirmed(): void {
    const item = this.pendingRemove;
    this.pendingRemove = null;
    if (!item) return;

    this.adminReportRecipientsService.remove(item.id).subscribe({
      next: () => {
        this.showSuccess('Destinatario eliminado.');
        this.fetch();
      },
      error: (err) => {
        console.error('[AdminReportRecipients] remove', err);
        this.showError(
          err?.error?.message || 'No se pudo eliminar el destinatario.',
        );
      },
    });
  }

  displayName(item: AdminReportRecipient): string {
    if (item.source === 'USER' && item.user) {
      const name = [item.user.firstName, item.user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      return name || item.displayName || '—';
    }
    return item.displayName || '—';
  }

  sourceLabel(source: string): string {
    return source === 'USER' ? 'Usuario' : 'Externo';
  }

  private showSuccess(message: string): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Listo',
      message,
      isSuccess: true,
      close: () => {
        this.modal.show = false;
      },
    };
  }

  private showError(message: string): void {
    const text = Array.isArray(message) ? message.join(', ') : message;
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Error',
      message: text,
      isError: true,
      close: () => {
        this.modal.show = false;
      },
    };
  }
}
