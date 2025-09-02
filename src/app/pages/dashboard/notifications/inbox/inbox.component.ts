import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InboxFiltersComponent,

} from '../../../../components/notifications/inbox/inbox-filters/inbox-filters.component';
import { NotificationService } from '../../../../services/notification.service';
import { InboxFilters, Notification, NotificationListResponse } from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, InboxFiltersComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
})
export class InboxComponent implements OnInit {
  filters: InboxFilters = {
  status: '',
  type: '',
  scope: '',
  fromDate: '',
  toDate: '',
  priority: '',
  readState: 'all',
};


  notifications: Notification[] = [];
  unreadCount = 0;
  page = 1;
  limit = 20;
  total = 0;

  loading = false;
  errorMsg = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  onFiltersChange(next: InboxFilters) {
    this.filters = { ...next };
    this.page = 1;
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    this.errorMsg = '';

    const isRead =
      this.filters.readState === 'unread' ? false :
      this.filters.readState === 'read'   ? true  :
      undefined;

    const opts: any = {
      page: this.page,
      limit: this.limit,
      fromDate: this.filters.fromDate || undefined,
      toDate: this.filters.toDate || undefined,
      status: this.filters.status || undefined,
      type: this.filters.type || undefined,
      scope: this.filters.scope || undefined,
      priority: this.filters.priority !== '' ? this.filters.priority : undefined,
      isRead,
    };

    Object.keys(opts).forEach(k => opts[k] === undefined && delete opts[k]);

    this.notificationService.getUserNotifications(opts).subscribe({
      next: (res) => {
        this.notifications = res.notifications || [];
        this.total = res.total || 0;
        this.unreadCount = this.notifications.filter(n => !n.readBy || n.readBy.length === 0).length;
        this.loading = false;
      },
      error: (err) => {
        console.error('[Inbox] error:', err);
        this.errorMsg = 'No se pudieron cargar las notificaciones.';
        this.loading = false;
      },
    });
  }

  trackById(index: number, n: Notification): number {
    return n.id;
  }
}