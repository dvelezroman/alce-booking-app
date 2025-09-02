import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InboxFiltersComponent,
  InboxFilters,
} from '../../../../components/notifications/inbox/inbox-filters/inbox-filters.component';
import { NotificationService } from '../../../../services/notification.service';
import { Notification, NotificationListResponse } from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, InboxFiltersComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
})
export class InboxComponent implements OnInit {
  filters: InboxFilters = {
    search: '',
    priorityBucket: 'all',
    readState: 'all',
    fromDate: '',
    toDate: '',
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

    const opts: {
      readDays?: number;
      page?: number;
      limit?: number;
      fromDate?: string;
      toDate?: string;
    } = {
      page: this.page,
      limit: this.limit,
    };

    if (this.filters.fromDate) opts.fromDate = this.filters.fromDate;
    if (this.filters.toDate) opts.toDate = this.filters.toDate;

    this.notificationService.getUserNotifications(opts).subscribe({
      next: (res: NotificationListResponse) => {
        this.notifications = res.notifications || [];
        this.total = res.total || 0;
        this.unreadCount = this.notifications.filter(n => !n.readBy || n.readBy.length === 0).length;

        console.log('[Inbox] fetched:', { opts, res });
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