import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Notification } from '../../../../services/dtos/notification.dto';
import { UserDto, UserRole } from '../../../../services/dtos/user.dto';
import { selectUserData } from '../../../../store/user.selector';
import { UsersService } from '../../../../services/users.service';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../../components/modal/modal.dto';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit, OnDestroy {
  notification?: Notification;
  toDisplayName = '';

  userRole: UserRole | null = null;
  protected readonly UserRole = UserRole;

  private destroy$ = new Subject<void>();

  modal: ModalDto = modalInitializer();
  deleting = false;

  private readonly statusEs: Record<Notification['status'], string> = {
    PENDING: 'Pendiente',
    SENT: 'Enviada',
    DELIVERED: 'Entregada',
    READ: 'Leída',
    FAILED: 'Fallida',
  };

  private readonly typeEs: Record<Notification['notificationType'], string> = {
    Announce: 'Anuncio',
    Advice: 'Aviso',
    Commentary: 'Comentario',
    Mandatory: 'Obligatoria',
    System: 'Sistema',
    Meeting: 'Reunión',
    Assessment: 'Evaluación',
  };

  private priorityEs(n?: number): string {
    if (n === 0) return 'Baja';
    if (n === 1) return 'Media';
    if (n === 2) return 'Alta';
    if (n === 3) return 'Urgente';
    return '—';
  }

  estadoLabel = '—';
  tipoLabel = '—';
  prioridadLabel = '—';

  constructor(
    private store: Store,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const st = history.state as { notification?: Notification };
    if (st?.notification) {
      this.notification = st.notification;
      this.estadoLabel = this.statusEs[this.notification.status];
      this.tipoLabel = this.typeEs[this.notification.notificationType];
      this.prioridadLabel = this.priorityEs(this.notification.priority);
    } else {
      this.router.navigate(['/dashboard/notifications-inbox']);
      return;
    }

    this.store
      .select(selectUserData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: UserDto | null) => {
        if (user) {
          this.applyUser(user);
        } else {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token) {
            this.usersService.refreshLogin().subscribe({
              next: (u) => this.applyUser(u),
              error: () => { /* noop */ }
            });
          }
        }
      });
  }

  private applyUser(user: UserDto) {
    this.userRole = user.role ?? null;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    this.toDisplayName = fullName || user.email || '';
    this.cdr.markForCheck();
  }

  get isAdmin(): boolean {
    return this.userRole === UserRole.ADMIN;
  }

  /** Lista de IDs a renderizar: si `to` tiene datos, usamos `to`; si no, `readBy`; si no, vacío. */
  get recipientIds(): number[] {
    const n = this.notification;
    if (!n) return [];
    if (Array.isArray(n.to) && n.to.length > 0) return n.to;
    if (Array.isArray(n.readBy) && n.readBy.length > 0) return n.readBy;
    return [];
  }

  /** True si el uid está en readBy (lo leyó). */
  isReadBy(uid: number): boolean {
    return !!this.notification?.readBy?.includes(uid);
  }

  trackByUid(index: number, uid: number): number {
    return uid;
  }

  goBack(): void {
    this.location.back();
  }

  onDeleteClick(): void {
    if (!this.notification?.id) return;
    this.openConfirmDelete(this.notification.id);
  }

  private openConfirmDelete(notificationId: number): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: 'Eliminar notificación',
      message: '¿Deseas eliminar esta notificación? Esta acción no se puede deshacer.',
      isInfo: true,
      showButtons: true,
      close: () => { this.modal.show = false; },
      confirm: () => this.confirmDelete(notificationId),
    };
  }

  private confirmDelete(notificationId: number): void {
    this.modal.show = false;
    this.deleting = true;

    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.deleting = false;
        this.showModalMessage({
          title: 'Notificación eliminada',
          message: 'La notificación fue eliminada correctamente.',
          isSuccess: true,
        });
        setTimeout(() => this.location.back(), 500);
      },
      error: () => {
        this.deleting = false;
        this.showModalMessage({
          title: 'Error al eliminar',
          message: 'No se pudo eliminar la notificación. Intenta nuevamente.',
          isError: true,
        });
      },
    });
  }

  private showModalMessage({
    title,
    message,
    isSuccess = false,
    isError = false,
  }: {
    title: string;
    message: string;
    isSuccess?: boolean;
    isError?: boolean;
  }) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title,
      message,
      isSuccess,
      isError,
      close: () => {
        this.modal.show = false;
        this.modal = modalInitializer();
      },
    };

    setTimeout(() => {
      this.modal.show = false;
      this.modal = modalInitializer();
    }, 2000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}