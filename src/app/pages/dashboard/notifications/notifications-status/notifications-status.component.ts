import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { FilterNotificationDto, Notification, NotificationListResponse } from '../../../../services/dtos/notification.dto';
import { formatToEcuadorTime } from '../../../../shared/utils/dates.util';

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
  limit = 30;
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

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const today = new Date();
    const daysAgo = new Date(today);
    daysAgo.setDate(today.getDate() - 5);

    this.fromDate = daysAgo.toISOString().slice(0, 10);
    this.toDate = today.toISOString().slice(0, 10);

    this.fetchNotifications();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  formatDate(dateStr?: string): string {
    return dateStr ? formatToEcuadorTime(dateStr) : '—';
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