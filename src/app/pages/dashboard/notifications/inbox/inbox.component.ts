import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import {
  Observable,
  take,
} from 'rxjs';

import {
  InboxFilters,
  Notification,
  NotificationTypeEnum,
} from '../../../../services/dtos/notification.dto';
import { UserDto } from '../../../../services/dtos/user.dto';

import { NotificationService } from '../../../../services/notification.service';
import { UsersService } from '../../../../services/users.service';

import { selectUserData } from '../../../../store/user.selector';

import {
  sanitizeNotificationBody,
} from '../../../../shared/utils/notification-message.util';

import {
  InboxHeaderComponent,
} from '../../../../components/notifications/inbox/inbox-header/inbox-header.component';

import {
  InboxFiltersComponent,
} from '../../../../components/notifications/inbox/inbox-filters/inbox-filters.component';

import {
  NotificationListComponent,
} from '../../../../components/notifications/inbox/notification-list/notification-list.component';

import {
  InboxSummaryComponent,
} from '../../../../components/notifications/inbox/inbox-summary/inbox-summary.component';

import {
  NotificationTypesSummaryComponent,
} from '../../../../components/notifications/inbox/notification-types-summary/notification-types-summary.component';

import {
  InboxPaginationComponent,
} from '../../../../components/notifications/inbox/inbox-pagination/inbox-pagination.component';

import {
  InboxLoadingComponent,
} from '../../../../components/notifications/inbox/inbox-loading/inbox-loading.component';

import {
  InboxEmptyComponent,
} from '../../../../components/notifications/inbox/inbox-empty/inbox-empty.component';

import {
  InboxErrorComponent,
} from '../../../../components/notifications/inbox/inbox-error/inbox-error.component';

export interface NotificationTypeSummary {
  type: Notification['notificationType'];
  label: string;
  count: number;
}

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    CommonModule,
    InboxHeaderComponent,
    InboxFiltersComponent,
    NotificationListComponent,
    InboxSummaryComponent,
    NotificationTypesSummaryComponent,
    InboxPaginationComponent,
    InboxLoadingComponent,
    InboxEmptyComponent,
    InboxErrorComponent,
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
})
export class InboxComponent implements OnInit {
  private currentUserId: number | null = null;

  notifications: Notification[] = [];
  showMobileFilters = false;

  unreadCount$!: Observable<number>;

  page = 1;
  limit = 20;
  total = 0;

  readDays = 30;

  loading = false;
  errorMsg = '';

  filters: InboxFilters = {
    search: '',
    status: '',
    type: '',
    scope: '',
    fromDate: '',
    toDate: '',
    priority: '',
    readState: 'all',
  };

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private store: Store,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.unreadCount$ =
      this.notificationService.unreadCount$;

    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((user: UserDto | null) => {
        this.currentUserId = user?.id ?? null;

        this.fetchNotifications();
      });
  }

  toggleMobileFilters(): void {
    this.showMobileFilters =
      !this.showMobileFilters;
  }

  fetchNotifications(): void {
    this.loading = true;
    this.errorMsg = '';

    this.notificationService
      .getUserNotifications({
        page: this.page,
        limit: this.limit,
        readDays: this.readDays,
      })
      .subscribe({
        next: (response) => {
          this.notifications = (
            response.notifications || []
          ).sort(
            (
              notificationA: Notification,
              notificationB: Notification
            ) =>
              new Date(
                notificationB.createdAt
              ).getTime() -
              new Date(
                notificationA.createdAt
              ).getTime()
          );

          this.total =
            response.total ||
            this.notifications.length ||
            0;

          this.loading = false;
        },
        error: (error) => {
          console.error(
            '[Inbox] error:',
            error
          );

          this.errorMsg =
            'No se pudieron cargar las notificaciones.';

          this.loading = false;
        },
      });
  }

  onReadDaysChange(days: number): void {
    this.readDays = days;
    this.page = 1;

    this.fetchNotifications();
  }

  onFiltersChange(
    filters: InboxFilters
  ): void {
    this.filters = {
      ...this.filters,
      ...filters,
    };

    this.page = 1;
  }

  onClearFilters(): void {
    this.filters = {
      search: '',
      status: '',
      type: '',
      scope: '',
      fromDate: '',
      toDate: '',
      priority: '',
      readState: 'all',
    };

    this.page = 1;
  }

  onPrev(): void {
    if (!this.hasPreviousPage) {
      return;
    }

    this.page--;

    this.fetchNotifications();
  }

  onNext(): void {
    if (!this.hasNextPage) {
      return;
    }

    this.page++;

    this.fetchNotifications();
  }

  onPageChange(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;

    this.fetchNotifications();
  }

  onLimitChange(limit: number): void {
    if (limit <= 0 || limit === this.limit) {
      return;
    }

    this.limit = limit;
    this.page = 1;

    this.fetchNotifications();
  }

  onRetry(): void {
    this.fetchNotifications();
  }

  onRowClick(
    notification: Notification
  ): void {
    if (!notification?.id) {
      return;
    }

    const goToDetail = (): void => {
      this.router.navigate(
        ['/dashboard/notifications-detail-v2'],
        {
          state: {
            notification,
            origin: 'inbox',
          },
        }
      );
    };

    if (notification.isRead) {
      goToDetail();
      return;
    }

    this.notificationService
      .markSingleAsRead(notification.id)
      .subscribe({
        next: () => {
          this.markNotificationLocallyAsRead(
            notification.id
          );

          this.usersService
            .refreshLogin()
            .subscribe({
              next: () => goToDetail(),
              error: () => goToDetail(),
            });
        },
        error: () => goToDetail(),
      });
  }

  trackById(
    index: number,
    notification: Notification
  ): number {
    return notification.id;
  }

  notificationBodySnippet(
    body: string
  ): string {
    return sanitizeNotificationBody(body);
  }

  get filteredNotifications(): Notification[] {
    const search =
      this.filters.search
        ?.trim()
        .toLowerCase() || '';

    return this.notifications.filter(
      (notification) => {
        const body =
          this.notificationBodySnippet(
            notification.message?.body || ''
          ).toLowerCase();

        const title =
          notification.title
            ?.toLowerCase() || '';

        const senderName =
          this.getSenderName(
            notification
          ).toLowerCase();

        const matchesSearch =
          !search ||
          title.includes(search) ||
          body.includes(search) ||
          senderName.includes(search);

        const matchesStatus =
          !this.filters.status ||
          notification.status ===
            this.filters.status;

        const matchesType =
          !this.filters.type ||
          notification.notificationType ===
            this.filters.type;

        const matchesScope =
          !this.filters.scope ||
          notification.scope ===
            this.filters.scope;

        const matchesPriority =
          this.filters.priority === '' ||
          notification.priority ===
            this.filters.priority;

        const matchesReadState =
          this.matchesReadState(
            notification
          );

        const matchesFromDate =
          this.matchesFromDate(
            notification
          );

        const matchesToDate =
          this.matchesToDate(
            notification
          );

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType &&
          matchesScope &&
          matchesPriority &&
          matchesReadState &&
          matchesFromDate &&
          matchesToDate
        );
      }
    );
  }

  get startIndex(): number {
    return this.total === 0
      ? 0
      : (this.page - 1) *
          this.limit +
          1;
  }

  get endIndex(): number {
    const end =
      this.page * this.limit;

    return end > this.total
      ? this.total
      : end;
  }

  get totalPages(): number {
    if (this.total === 0) {
      return 1;
    }

    return Math.ceil(
      this.total / this.limit
    );
  }

  get hasPreviousPage(): boolean {
    return this.page > 1;
  }

  get hasNextPage(): boolean {
    return (
      this.page * this.limit <
      this.total
    );
  }

  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  get hasFilteredNotifications(): boolean {
    return (
      this.filteredNotifications.length >
      0
    );
  }

  get showEmptyState(): boolean {
    return (
      !this.loading &&
      !this.errorMsg &&
      !this.hasNotifications
    );
  }

  get showNoResultsState(): boolean {
    return (
      !this.loading &&
      !this.errorMsg &&
      this.hasNotifications &&
      !this.hasFilteredNotifications
    );
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;
  }

  get readNotificationsCount(): number {
    return this.notifications.filter(
      (notification) =>
        notification.isRead
    ).length;
  }

  get todayNotificationsCount(): number {
    const today =
      this.getStartOfDay(
        new Date()
      ).getTime();

    return this.notifications.filter(
      (notification) => {
        const createdAt =
          this.getStartOfDay(
            new Date(
              notification.createdAt
            )
          ).getTime();

        return createdAt === today;
      }
    ).length;
  }

  get weekNotificationsCount(): number {
    const now = new Date();

    const weekStart =
      this.getStartOfDay(now);

    weekStart.setDate(
      weekStart.getDate() -
        weekStart.getDay()
    );

    return this.notifications.filter(
      (notification) => {
        const createdAt =
          new Date(
            notification.createdAt
          );

        return createdAt >= weekStart;
      }
    ).length;
  }

  get notificationTypeSummary():
    NotificationTypeSummary[] {
    return [
      {
        type:
          NotificationTypeEnum.Meeting,
        label: 'Clases',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.Meeting
          ),
      },
      {
        type:
          NotificationTypeEnum.Assessment,
        label: 'Evaluaciones',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.Assessment
          ),
      },
      {
        type:
          NotificationTypeEnum.Announce,
        label: 'Anuncios',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.Announce
          ),
      },
      {
        type:
          NotificationTypeEnum.Advice,
        label: 'Avisos',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.Advice
          ),
      },
      {
        type:
          NotificationTypeEnum.Commentary,
        label: 'Comentarios',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.Commentary
          ),
      },
      {
        type:
          NotificationTypeEnum.Mandatory,
        label: 'Importantes',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.Mandatory
          ),
      },
      {
        type:
          NotificationTypeEnum.System,
        label: 'Sistema',
        count:
          this.getNotificationTypeCount(
            NotificationTypeEnum.System
          ),
      },
    ];
  }

  private getNotificationTypeCount(
    type: Notification['notificationType']
  ): number {
    return this.notifications.filter(
      (notification) =>
        notification.notificationType ===
        type
    ).length;
  }

  private matchesReadState(
    notification: Notification
  ): boolean {
    if (
      !this.filters.readState ||
      this.filters.readState === 'all'
    ) {
      return true;
    }

    if (
      this.filters.readState ===
      'unread'
    ) {
      return !notification.isRead;
    }

    return !!notification.isRead;
  }

  private matchesFromDate(
    notification: Notification
  ): boolean {
    if (!this.filters.fromDate) {
      return true;
    }

    const notificationDate =
      new Date(
        notification.createdAt
      );

    const fromDate =
      this.getStartOfDay(
        new Date(
          `${this.filters.fromDate}T00:00:00`
        )
      );

    return notificationDate >= fromDate;
  }

  private matchesToDate(
    notification: Notification
  ): boolean {
    if (!this.filters.toDate) {
      return true;
    }

    const notificationDate =
      new Date(
        notification.createdAt
      );

    const toDate =
      new Date(
        `${this.filters.toDate}T23:59:59.999`
      );

    return notificationDate <= toDate;
  }

  private getSenderName(
    notification: Notification
  ): string {
    const firstName =
      notification.fromUser
        ?.firstName || '';

    const lastName =
      notification.fromUser
        ?.lastName || '';

    return `${firstName} ${lastName}`.trim();
  }

  private getStartOfDay(
    date: Date
  ): Date {
    const normalizedDate =
      new Date(date);

    normalizedDate.setHours(
      0,
      0,
      0,
      0
    );

    return normalizedDate;
  }

  private markNotificationLocallyAsRead(
    notificationId: number
  ): void {
    this.notifications =
      this.notifications.map(
        (notification) => {
          if (
            notification.id !==
            notificationId
          ) {
            return notification;
          }

          return {
            ...notification,
            isRead: true,
            status: 'READ',
            readAt:
              notification.readAt ||
              new Date().toISOString(),
          };
        }
      );
  }
}