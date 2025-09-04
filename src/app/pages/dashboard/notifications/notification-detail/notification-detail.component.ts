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

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit, OnDestroy {
  notification?: Notification;
  toDisplayName = '';

  userRole: UserRole | null = null;
  protected readonly UserRole = UserRole;

  private destroy$ = new Subject<void>();

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
    private usersService: UsersService
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
              error: () => { /* null */ }
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

  trackByUid(index: number, uid: number): number {
    return uid;
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}