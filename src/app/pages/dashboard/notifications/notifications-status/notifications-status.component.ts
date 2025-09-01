import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { FilterNotificationDto, Notification } from '../../../../services/dtos/notification.dto';
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
  statusFilter: 'SENT' | 'PENDING' | 'DELIVERED' | 'READ' | 'FAILED' | '' = '';
  typeFilter: Notification['notificationType'] | '' = '';
  scopeFilter: Notification['scope'] | '' = '';
  showFilters = false;

  fromDate: string = '';
  toDate: string = '';

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
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 5);

    this.fromDate = twoDaysAgo.toISOString().slice(0, 10);
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
      // fromDate: this.fromDate,
      // toDate: this.toDate,
    };

    if (this.statusFilter) {
      filters.status = this.statusFilter;
    }

    if (this.scopeFilter) {
      filters.scope = this.scopeFilter;
    }

    if (this.typeFilter) {
      filters.notificationType = this.typeFilter;
    }

    this.notificationService.getNotifications(filters).subscribe({
      next: (data: any) => {
        const result = Array.isArray(data)
          ? data
          : (data?.notifications ?? []);

         this.notifications = result.sort((a: Notification, b: Notification) =>
          (b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0) -
          (a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0)
        );

        //console.log('notificaciones recibidas:', this.notifications);
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
      },
    });
  }
}