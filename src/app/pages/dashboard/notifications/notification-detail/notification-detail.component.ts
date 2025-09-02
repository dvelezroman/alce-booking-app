import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { Notification } from '../../../../services/dtos/notification.dto';
import { UserDto } from '../../../../services/dtos/user.dto';
import { selectUserData } from '../../../../store/user.selector';


@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit {
  notification?: Notification;
  toDisplayName = '';

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
    private router: Router,
    private store: Store,
    private cdr: ChangeDetectorRef,
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
      .pipe(take(1))
      .subscribe({
        next: (user: UserDto | null) => {
          const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
          this.toDisplayName = fullName || user?.email || '';
          this.cdr.markForCheck(); 
        },
        error: () => {
          this.toDisplayName = '';
          this.cdr.markForCheck();
        },
      });
  }
}