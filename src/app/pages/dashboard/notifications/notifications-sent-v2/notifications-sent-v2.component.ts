import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

import { NotificationSentFiltersComponent } from '../../../../components/notifications/sent/notification-sent-filters/notification-sent-filters.component';
import { NotificationSentHeaderComponent } from '../../../../components/notifications/sent/notification-sent-header/notification-sent-header.component';
import { NotificationSentPaginationComponent } from '../../../../components/notifications/sent/notification-sent-pagination/notification-sent-pagination.component';
import { NotificationSentTableComponent } from '../../../../components/notifications/sent/notification-sent-table/notification-sent-table.component';

import {
  Notification as AppNotification,
  NotificationListResponse,
} from '../../../../services/dtos/notification.dto';
import { UserDto } from '../../../../services/dtos/user.dto';
import { NotificationService } from '../../../../services/notification.service';
import { sanitizeNotificationBody } from '../../../../shared/utils/notification-message.util';
import { selectUserData } from '../../../../store/user.selector';

@Component({
  selector: 'app-notifications-sent-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NotificationSentHeaderComponent,
    NotificationSentFiltersComponent,
    NotificationSentTableComponent,
    NotificationSentPaginationComponent,
  ],
  templateUrl: './notifications-sent-v2.component.html',
  styleUrl: './notifications-sent-v2.component.scss',
})
export class NotificationsSentV2Component implements OnInit {

  Math = Math;

  private currentUserId: number | null = null;

  items: AppNotification[] = [];
  total = 0;
  page = 1;
  limit = 10;

  // Filtros
  fromDate = '';
  toDate = '';

  loading = false;

  constructor(
    private store: Store,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const daysAgo = new Date(today);
    daysAgo.setDate(today.getDate() - 30);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.fromDate = daysAgo.toISOString().slice(0, 10);
    this.toDate = tomorrow.toISOString().slice(0, 10);

    this.store
      .select(selectUserData)
      .pipe(filter((u): u is UserDto => !!u))
      .subscribe((u: UserDto) => {
        this.currentUserId = u.id;
        this.fetch();
      });
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetch();
  }

  onCreateNotification(): void {
    this.router.navigate([
      '/dashboard/broadcast-groups-v2',
    ]);
  }

  fetch(): void {
    if (!this.currentUserId) return;

    this.loading = true;

    this.notificationService
      .getNotifications({
        fromUserId: this.currentUserId,
        page: this.page,
        limit: this.limit,
        fromDate: this.fromDate || undefined,
        toDate: this.toDate || undefined,
      })
      .subscribe({
        next: (res) => {
          const r = res as NotificationListResponse;

          this.items = this.sortNotifications(
            r.notifications || [],
          );

          this.total = r.total ?? this.items.length;
          this.loading = false;
        },
        error: () => {
          this.items = [];
          this.total = 0;
          this.loading = false;
        },
      });
  }

  private sortNotifications(
    notifications: AppNotification[],
  ): AppNotification[] {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(
        a.sentAt || a.createdAt,
      ).getTime();

      const dateB = new Date(
        b.sentAt || b.createdAt,
      ).getTime();

      return dateB - dateA;
    });
  }

  get startIndex(): number {
    return this.total === 0
      ? 0
      : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    return Math.min(
      this.page * this.limit,
      this.total,
    );
  }

  onPrev(): void {
    if (this.page > 1) {
      this.page--;
      this.fetch();
    }
  }

  onNext(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.fetch();
    }
  }

  trackById(
    index: number,
    n: AppNotification,
  ) {
    return n.id;
  }

  notificationBodySnippet(
    body: string,
  ): string {
    return sanitizeNotificationBody(body);
  }

  onRowClick(
    notification: AppNotification,
  ): void {
    this.router.navigate(
      ['/dashboard/notifications-detail-v2'],
      {
        state: {
          notification,
          origin: 'sent',
        },
      },
    );
  }

  onLimitChange(limit: number): void {
    this.limit = limit;
    this.page = 1;
    this.fetch();
  }
}