import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { FilterNotificationDto, Notification, NotificationListResponse } from '../../../../services/dtos/notification.dto';
import { formatToEcuadorTime } from '../../../../shared/utils/dates.util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-status.component.html',
  styleUrl: './notifications-status.component.scss',
})
export class NotificationsStatusComponent implements OnInit {
  notifications: Notification[] = [];

  // filtros
  statusFilter: 'SENT' | 'PENDING' | 'DELIVERED' | 'READ' | 'FAILED' | '' = '';
  typeFilter: Notification['notificationType'] | '' = '';
  scopeFilter: Notification['scope'] | '' = '';
  showFilters = false;
  fromDate: string = '';
  toDate: string = '';

  // paginación
  page = 1;
  limit = 20;
  total = 0;

  // maps
  statusMap: Record<string, string> = {
    SENT: 'Enviado',
    PENDING: 'Pendiente',
    DELIVERED: 'Entregado',
    READ: 'Leído',
    FAILED: 'Fallido',
  };

  typeMap: Record<string, string> = {
    Announce: 'Anuncio',
    Advice: 'Consejo',
    Commentary: 'Comentario',
    Mandatory: 'Obligatorio',
    System: 'Sistema',
    Meeting: 'Reunión',
    Assessment: 'Evaluación',
  };

  priorityMap: Record<number, string> = {
    0: 'Baja',
    1: 'Normal',
    2: 'Alta',
    3: 'Urgente',
  };

  constructor(private notificationService: NotificationService, private router: Router ) {}

  ngOnInit(): void {
    const today = new Date();
    const daysAgo = new Date(today);
    daysAgo.setDate(today.getDate() - 30);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.fromDate = daysAgo.toISOString().slice(0, 10);
    this.toDate = tomorrow.toISOString().slice(0, 10);

    this.fetchNotifications();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  formatDate(dateStr?: string): string {
    return dateStr ? formatToEcuadorTime(dateStr) : '—';
  }

  // helper: nombre del remitente
  senderName(n: Notification): string {
    const fn = n.fromUser?.firstName?.trim() || '';
    const ln = n.fromUser?.lastName?.trim() || '';
    const full = `${fn} ${ln}`.trim();
    return full || n.fromUser?.email || `ID ${n.fromUser?.id ?? n.from}`;
  }

  // helper: label genérico para otros scopes
  scopeLabel(n: Notification): string {
    switch (n.scope) {
      case 'ALL_USERS': return 'Todos los usuarios';
      case 'ALL_STUDENTS': return 'Todos los estudiantes';
      case 'ALL_INSTRUCTORS': return 'Todos los instructores';
      case 'INDIVIDUAL': return `${n.to?.length ?? 0}`;
      case 'STAGE_STUDENTS': {
        const stageTxt = n.stage?.number ? `Etapa ${n.stage.number}` : 'Etapa';
        return n.to?.length ? `${stageTxt} · ${n.to.length}` : stageTxt;
      }
      default: return n.scope || '—';
    }
  }

  onRowClick(n: Notification) {
    this.router.navigate(
      ['/dashboard/notifications-detail'],
      { state: { notification: n, origin: 'status' } }
    );
  }

  fetchNotifications(): void {
    const filters: FilterNotificationDto = {
      page: this.page,
      limit: this.limit,
    };
    


    // (opcional) si tu backend respeta fechas:
    if (this.fromDate) filters.fromDate = this.fromDate;
    if (this.toDate)   filters.toDate   = this.toDate;

    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.scopeFilter)  filters.scope = this.scopeFilter;
    if (this.typeFilter)   filters.notificationType = this.typeFilter;

    this.notificationService.getNotifications(filters).subscribe({
      next: (data: Notification[] | NotificationListResponse) => {
        const r = Array.isArray(data)
          ? { notifications: data, total: data.length, page: this.page, limit: this.limit, totalPages: 1 }
          : data;

        this.notifications = (r.notifications ?? []).sort((a, b) =>
          (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0) -
          (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0)
        );

        this.total = r.total ?? this.notifications.length;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.notifications = [];
        this.total = 0;
      },
    });
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }
  get endIndex(): number {
    const end = this.page * this.limit;
    return end > this.total ? this.total : end;
  }

  // paginación
  onPrev(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchNotifications();
    }
  }
  onNext(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.fetchNotifications();
    }
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetchNotifications();
  }
}
