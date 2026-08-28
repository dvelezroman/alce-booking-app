import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EmailSuppression,
  EmailSuppressionService,
  MatchedUser,
} from '../../../../services/email-suppression.service';
import {
  ModalDto,
  modalInitializer,
} from '../../../../components/modal/modal.dto';
import { ModalComponent } from '../../../../components/modal/modal.component';

@Component({
  selector: 'app-suppressed-emails',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './suppressed-emails.component.html',
  styleUrl: './suppressed-emails.component.scss',
})
export class SuppressedEmailsComponent implements OnInit {
  items: EmailSuppression[] = [];
  page = 1;
  limit = 20;
  total = 0;
  loading = false;
  errorMsg = '';

  search = '';
  activeFilter: 'all' | 'true' | 'false' = 'true';

  showEditModal = false;
  showNotifyModal = false;
  showBulkNotifyModal = false;
  showUserModal = false;
  editing: EmailSuppression | null = null;
  isCreate = false;

  formEmail = '';
  formReason = '';
  formActive = true;

  notifyTarget: EmailSuppression | null = null;
  notifyTitle = 'Actualiza tu correo electrónico';
  notifyMessage = '';
  selectedUserIds = new Set<number>();

  bulkNotifyTitle = 'Actualiza tu correo electrónico';
  bulkNotifyMessage = '';
  bulkNotifyPreview: {
    totalSuppressions: number;
    withUsersCount: number;
    uniqueUserCount: number;
    withoutUsersCount: number;
  } | null = null;
  bulkNotifyLoading = false;
  bulkNotifySending = false;
  selectedUser: MatchedUser | null = null;
  selectedBannedEmail = '';

  modal: ModalDto = modalInitializer();

  constructor(private emailSuppressionService: EmailSuppressionService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.errorMsg = '';

    const active =
      this.activeFilter === 'all'
        ? undefined
        : this.activeFilter === 'true';

    this.emailSuppressionService
      .list({
        page: this.page,
        limit: this.limit,
        search: this.search.trim() || undefined,
        active,
      })
      .subscribe({
        next: (res) => {
          this.items = res.items || [];
          this.total = res.total || 0;
          this.page = res.page || this.page;
          this.limit = res.limit || this.limit;
          this.loading = false;
        },
        error: (err) => {
          console.error('[SuppressedEmails]', err);
          this.errorMsg = 'No se pudo cargar la lista de emails baneados.';
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.page = 1;
    this.fetch();
  }

  clearSearch(): void {
    this.search = '';
    this.page = 1;
    this.fetch();
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetch();
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.total ? this.total : end;
  }

  onPrev(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.fetch();
  }

  onNext(): void {
    if (this.page * this.limit >= this.total) return;
    this.page += 1;
    this.fetch();
  }

  openCreate(): void {
    this.isCreate = true;
    this.editing = null;
    this.formEmail = '';
    this.formReason = '';
    this.formActive = true;
    this.showEditModal = true;
  }

  openEdit(item: EmailSuppression): void {
    this.isCreate = false;
    this.editing = item;
    this.formEmail = item.email;
    this.formReason = item.reason || '';
    this.formActive = item.active;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editing = null;
  }

  saveForm(): void {
    const email = this.formEmail.trim().toLowerCase();
    if (!email) {
      this.showError('El email es obligatorio.');
      return;
    }

    if (this.isCreate) {
      this.emailSuppressionService
        .create({ email, reason: this.formReason.trim() || undefined })
        .subscribe({
          next: () => {
            this.closeEditModal();
            this.showSuccess('Email agregado a la lista de ban.');
            this.fetch();
          },
          error: (err) => {
            this.showError(
              err?.error?.message || 'No se pudo agregar el email.',
            );
          },
        });
      return;
    }

    if (!this.editing) return;

    this.emailSuppressionService
      .update(this.editing.id, {
        email,
        reason: this.formReason,
        active: this.formActive,
      })
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.showSuccess('Email actualizado.');
          this.fetch();
        },
        error: (err) => {
          this.showError(
            err?.error?.message || 'No se pudo actualizar el email.',
          );
        },
      });
  }

  requestLift(item: EmailSuppression): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Quitar ban',
      message: `¿Quitar el ban de <strong>${item.email}</strong>? Podrá volver a recibir emails.`,
      showButtons: true,
      isInfo: true,
      confirm: () => {
        this.modal.show = false;
        this.emailSuppressionService.lift(item.id).subscribe({
          next: () => {
            this.showSuccess('Ban levantado.');
            this.fetch();
          },
          error: (err) => {
            this.showError(
              err?.error?.message || 'No se pudo quitar el ban.',
            );
          },
        });
      },
      close: () => {
        this.modal.show = false;
      },
    };
  }

  private currentListFilters(): { search?: string; active?: boolean } {
    const active =
      this.activeFilter === 'all'
        ? undefined
        : this.activeFilter === 'true';
    return {
      search: this.search.trim() || undefined,
      active,
    };
  }

  openBulkNotify(): void {
    this.bulkNotifyTitle = 'Actualiza tu correo electrónico';
    this.bulkNotifyMessage = '';
    this.bulkNotifyPreview = null;
    this.bulkNotifyLoading = true;
    this.showBulkNotifyModal = true;

    this.emailSuppressionService
      .previewBulkNotify(this.currentListFilters())
      .subscribe({
        next: (preview) => {
          this.bulkNotifyPreview = preview;
          this.bulkNotifyLoading = false;
        },
        error: (err) => {
          this.bulkNotifyLoading = false;
          this.showBulkNotifyModal = false;
          this.showError(
            err?.error?.message ||
              'No se pudo cargar el resumen de notificaciones.',
          );
        },
      });
  }

  closeBulkNotifyModal(): void {
    this.showBulkNotifyModal = false;
    this.bulkNotifyPreview = null;
    this.bulkNotifySending = false;
  }

  sendBulkNotify(): void {
    if (!this.bulkNotifyPreview?.withUsersCount) {
      this.showError('No hay usuarios vinculados para notificar.');
      return;
    }

    this.bulkNotifySending = true;
    this.emailSuppressionService
      .bulkNotify({
        ...this.currentListFilters(),
        title: this.bulkNotifyTitle.trim() || undefined,
        message: this.bulkNotifyMessage.trim() || undefined,
      })
      .subscribe({
        next: (result) => {
          this.closeBulkNotifyModal();
          const parts = [
            `${result.uniqueUsersNotified} usuario(s) notificado(s)`,
            `${result.notifiedSuppressions} email(s) baneado(s) procesado(s)`,
          ];
          if (result.skippedNoUsers) {
            parts.push(`${result.skippedNoUsers} sin usuario vinculado`);
          }
          if (result.failed) {
            parts.push(`${result.failed} fallido(s)`);
          }
          this.showSuccess(`Notificación in-app enviada: ${parts.join(', ')}.`);
          this.fetch();
        },
        error: (err) => {
          this.bulkNotifySending = false;
          this.showError(
            err?.error?.message ||
              'No se pudo enviar las notificaciones masivas.',
          );
        },
      });
  }

  openNotify(item: EmailSuppression): void {
    if (!item.matchedUsers?.length) {
      this.showError('No hay usuario vinculado para notificar.');
      return;
    }
    this.notifyTarget = item;
    this.notifyTitle = 'Actualiza tu correo electrónico';
    this.notifyMessage = `Tu dirección de correo (${item.email}) está bloqueada o es inválida. Por favor actualízala en tu perfil para seguir recibiendo notificaciones por email.`;
    this.selectedUserIds = new Set(item.matchedUsers.map((u) => u.id));
    this.showNotifyModal = true;
  }

  closeNotifyModal(): void {
    this.showNotifyModal = false;
    this.notifyTarget = null;
  }

  toggleUser(userId: number): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.has(userId);
  }

  sendNotify(): void {
    if (!this.notifyTarget) return;
    const userIds = Array.from(this.selectedUserIds);
    if (!userIds.length) {
      this.showError('Selecciona al menos un usuario.');
      return;
    }

    this.emailSuppressionService
      .notify(this.notifyTarget.id, {
        userIds,
        title: this.notifyTitle.trim() || undefined,
        message: this.notifyMessage.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.closeNotifyModal();
          this.showSuccess('Notificación in-app enviada.');
          this.fetch();
        },
        error: (err) => {
          this.showError(
            err?.error?.message || 'No se pudo enviar la notificación.',
          );
        },
      });
  }

  openUserDetail(user: MatchedUser, bannedEmail: string): void {
    this.selectedUser = user;
    this.selectedBannedEmail = bannedEmail;
    this.showUserModal = true;
  }

  closeUserDetail(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.selectedBannedEmail = '';
  }

  userDisplayName(user: MatchedUser): string {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name || `Usuario #${user.id}`;
  }

  matchFieldLabel(field: string): string {
    switch (field) {
      case 'email':
        return 'Login';
      case 'emailAddress':
        return 'Email contacto';
      case 'tutorEmail':
        return 'Tutor';
      default:
        return field;
    }
  }

  roleLabel(role?: string | null): string {
    switch (role) {
      case 'STUDENT':
        return 'Estudiante';
      case 'INSTRUCTOR':
        return 'Instructor';
      case 'ADMIN':
        return 'Admin';
      default:
        return role || '—';
    }
  }

  statusLabel(status?: string | null): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'HOLD':
        return 'Hold';
      case 'BLOCK':
        return 'Bloqueado';
      default:
        return status || '—';
    }
  }

  sourceLabel(source: string): string {
    switch (source) {
      case 'SEND_FAILURE':
        return 'Fallo de envío';
      case 'MANUAL':
        return 'Manual';
      case 'INVALID_ADDRESS':
        return 'Dirección inválida';
      default:
        return source;
    }
  }

  formatDate(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
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
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Error',
      message,
      isError: true,
      close: () => {
        this.modal.show = false;
      },
    };
  }
}
