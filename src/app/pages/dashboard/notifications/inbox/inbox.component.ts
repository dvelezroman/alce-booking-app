import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';

import {
  InboxFilters,
  Notification,
  NotificationTypeEnum,
} from '../../../../services/dtos/notification.dto';
import { UserDto, UserRole } from '../../../../services/dtos/user.dto';

import { NotificationService } from '../../../../services/notification.service';
import { UsersService } from '../../../../services/users.service';
import { LeadSchedulingPendingCountService } from '../../../../services/lead-scheduling-pending-count.service';

import { selectUserData } from '../../../../store/user.selector';

import {
  sanitizeNotificationBody,
} from '../../../../shared/utils/notification-message.util';
import {
  isInstructorOperationalNotification,
  resolveInstructorNotificationTarget,
} from '../../../../shared/utils/notification-routing.util';

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

import {
  NotificationDeleteConfirmModalComponent,
} from '../../../../components/notifications/notification-delete-confirm-modal/notification-delete-confirm-modal.component';

import { ModalComponent } from '../../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../../components/modal/modal.dto';

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
    RouterModule,
    InboxHeaderComponent,
    InboxFiltersComponent,
    NotificationListComponent,
    InboxSummaryComponent,
    NotificationTypesSummaryComponent,
    InboxPaginationComponent,
    InboxLoadingComponent,
    InboxEmptyComponent,
    InboxErrorComponent,
    NotificationDeleteConfirmModalComponent,
    ModalComponent,
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
})
export class InboxComponent implements OnInit, OnDestroy {
  private currentUserId: number | null = null;
  private readonly subs = new Subscription();

  isInstructor = false;
  pendingAssignmentCount = 0;
  scheduledReportPendingCount = 0;

  notifications: Notification[] = [];
  showMobileFilters = false;

  page = 1;
  limit = 20;
  total = 0;
  inboxUnreadCount = 0;

  readDays = 30;

  loading = false;
  errorMsg = '';
  selectedNotificationIds = new Set<number>();
  bulkActionLoading = false;
  showDeleteConfirmModal = false;
  deleteConfirmLoading = false;
  modal: ModalDto = modalInitializer();

  filters: InboxFilters = {
    search: '',
    status: '',
    type: '',
    scope: '',
    fromDate: '',
    toDate: '',
    priority: '',
    readState: 'all',
    inboxCategory: 'all',
  };

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private usersService: UsersService,
    private leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.inboxUnreadCount =
      this.notificationService.currentUnreadCount;

    this.subs.add(
      this.leadSchedulingPending.instructorPendingAssignmentCount$.subscribe(
        (count) => (this.pendingAssignmentCount = count),
      ),
    );
    this.subs.add(
      this.leadSchedulingPending.instructorScheduledReportPendingCount$.subscribe(
        (count) => (this.scheduledReportPendingCount = count),
      ),
    );

    this.subs.add(
      this.route.queryParamMap.subscribe((params) => {
        const category = params.get('category');
        if (
          category === 'action' ||
          category === 'communications' ||
          category === 'all'
        ) {
          this.filters = {
            ...this.filters,
            inboxCategory: category,
          };
        }
      }),
    );

    this.store
      .select(selectUserData)
      .pipe(take(1))
      .subscribe((user: UserDto | null) => {
        this.currentUserId = user?.id ?? null;
        this.isInstructor = user?.role === UserRole.INSTRUCTOR;

        if (this.isInstructor) {
          this.leadSchedulingPending
            .refresh(UserRole.INSTRUCTOR)
            .subscribe();
        }

        this.fetchNotifications();
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get showSchedulingBanner(): boolean {
    return (
      this.isInstructor &&
      (this.pendingAssignmentCount > 0 ||
        this.scheduledReportPendingCount > 0)
    );
  }

  get schedulingBannerText(): string {
    return `${this.pendingAssignmentCount} por atender · ${this.scheduledReportPendingCount} informe pendiente`;
  }

  setInboxCategory(
    category: NonNullable<InboxFilters['inboxCategory']>,
  ): void {
    this.filters = {
      ...this.filters,
      inboxCategory: category,
    };
    this.page = 1;
    this.selectedNotificationIds.clear();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: category === 'all' ? null : category,
      },
      queryParamsHandling: 'merge',
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

          if (typeof response.unreadCount === 'number') {
            this.inboxUnreadCount = response.unreadCount;
          }

          this.selectedNotificationIds.clear();
          this.loading = false;
        },
        error: (error) => {
          console.error(
            '[Inbox] error:',
            error
          );

          this.errorMsg =
            'No se pudieron cargar las notificaciones.';

          this.selectedNotificationIds.clear();
          this.loading = false;
        },
      });
  }

  onToggleSelection(notificationId: number): void {
    if (this.selectedNotificationIds.has(notificationId)) {
      this.selectedNotificationIds.delete(notificationId);
    } else {
      this.selectedNotificationIds.add(notificationId);
    }

    this.selectedNotificationIds = new Set(this.selectedNotificationIds);
  }

  onSelectAllVisible(checked: boolean): void {
    const visibleIds = this.filteredNotifications.map(
      (notification) => notification.id,
    );

    if (checked) {
      visibleIds.forEach((id) => this.selectedNotificationIds.add(id));
    } else {
      visibleIds.forEach((id) => this.selectedNotificationIds.delete(id));
    }

    this.selectedNotificationIds = new Set(this.selectedNotificationIds);
  }

  get selectedNotificationIdsList(): number[] {
    return Array.from(this.selectedNotificationIds);
  }

  get allVisibleSelected(): boolean {
    const visible = this.filteredNotifications;

    return (
      visible.length > 0 &&
      visible.every((notification) =>
        this.selectedNotificationIds.has(notification.id),
      )
    );
  }

  get someVisibleSelected(): boolean {
    const visible = this.filteredNotifications;
    const selectedOnPage = visible.filter((notification) =>
      this.selectedNotificationIds.has(notification.id),
    ).length;

    return selectedOnPage > 0 && selectedOnPage < visible.length;
  }

  onMarkAllAsRead(): void {
    if (this.inboxUnreadCount === 0 || this.bulkActionLoading) {
      return;
    }

    const hasOperationalUnread =
      this.isInstructor &&
      this.notifications.some(
        (notification) =>
          !notification.isRead &&
          isInstructorOperationalNotification(notification),
      );

    const runMarkAll = (): void => {
      this.bulkActionLoading = true;

      this.notificationService.markAllAsRead().subscribe({
        next: () => {
          this.notifications = this.notifications.map((notification) => ({
            ...notification,
            isRead: true,
            status: 'READ',
            readAt: notification.readAt || new Date().toISOString(),
          }));
          this.inboxUnreadCount = 0;
          this.notificationService.setUnreadCount(0);
          this.bulkActionLoading = false;

          if (hasOperationalUnread) {
            this.showFeedbackModal({
              title: 'Notificaciones marcadas como leídas',
              message:
                'Las solicitudes de agendamiento pendientes siguen en Solicitudes de agendamiento. Marcar como leído no cierra el trabajo.',
              isSuccess: true,
            });
          }
        },
        error: (error) => {
          console.error('[Inbox] mark all as read failed:', error);
          this.bulkActionLoading = false;
        },
      });
    };

    if (hasOperationalUnread) {
      this.modal = {
        ...modalInitializer(),
        show: true,
        title: 'Marcar todas como leídas',
        message:
          'Esto solo marca avisos como leídos. Las solicitudes de cortesía, speaking u otras colas operativas siguen pendientes en Solicitudes de agendamiento.',
        isInfo: true,
        showButtons: true,
        close: () => {
          this.modal.show = false;
        },
        confirm: () => {
          this.modal.show = false;
          runMarkAll();
        },
      };
      return;
    }

    runMarkAll();
  }

  onDeleteSelected(): void {
    if (
      this.selectedNotificationIds.size === 0 ||
      this.bulkActionLoading ||
      this.deleteConfirmLoading
    ) {
      return;
    }

    this.showDeleteConfirmModal = true;
  }

  onCancelDeleteConfirm(): void {
    if (this.deleteConfirmLoading) {
      return;
    }

    this.showDeleteConfirmModal = false;
  }

  onConfirmDeleteSelected(): void {
    const ids = this.selectedNotificationIdsList;

    if (ids.length === 0 || this.deleteConfirmLoading) {
      return;
    }

    this.deleteConfirmLoading = true;
    this.bulkActionLoading = true;

    this.notificationService.deleteForUser(ids).subscribe({
      next: () => {
        const deletedCount = ids.length;

        this.showDeleteConfirmModal = false;
        this.deleteConfirmLoading = false;
        this.selectedNotificationIds.clear();
        this.fetchNotifications();
        this.notificationService.loadUnreadCount().subscribe();
        this.bulkActionLoading = false;

        this.showFeedbackModal({
          title: 'Notificaciones eliminadas',
          message:
            deletedCount === 1
              ? 'La notificación fue eliminada de tu bandeja.'
              : `${deletedCount} notificaciones fueron eliminadas de tu bandeja.`,
          isSuccess: true,
        });
      },
      error: (error) => {
        console.error('[Inbox] delete notifications failed:', error);
        this.deleteConfirmLoading = false;
        this.bulkActionLoading = false;

        this.showFeedbackModal({
          title: 'No se pudo eliminar',
          message:
            'Ocurrió un error al eliminar las notificaciones. Intenta nuevamente.',
          isError: true,
        });
      },
    });
  }

  get selectedNotificationsForDelete(): Notification[] {
    return this.notifications.filter((notification) =>
      this.selectedNotificationIds.has(notification.id),
    );
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
      inboxCategory: 'all',
    };

    this.page = 1;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: null },
      queryParamsHandling: 'merge',
    });
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

    const goToDestination = (): void => {
      if (this.isInstructor) {
        const target =
          resolveInstructorNotificationTarget(
            notification,
          );

        if (target) {
          if (
            /^https?:\/\//i.test(target.path)
          ) {
            window.location.href = target.path;
            return;
          }

          let url = target.path;
          if (target.queryParams) {
            const qs = new URLSearchParams(
              target.queryParams,
            ).toString();
            url = `${target.path}?${qs}`;
          }
          void this.router.navigateByUrl(url);
          return;
        }
      }

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
      goToDestination();
      return;
    }

    this.notificationService
      .markSingleAsRead(notification.id)
      .subscribe({
        next: () => {
          this.markNotificationLocallyAsRead(
            notification.id
          );
          this.inboxUnreadCount = Math.max(
            0,
            this.inboxUnreadCount - 1
          );
          this.notificationService.setUnreadCount(
            this.inboxUnreadCount
          );

          this.usersService
            .refreshLogin()
            .subscribe({
              next: () => goToDestination(),
              error: () => goToDestination(),
            });
        },
        error: () => goToDestination(),
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

        const matchesCategory =
          this.matchesInboxCategory(
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
          matchesToDate &&
          matchesCategory
        );
      }
    );
  }

  private matchesInboxCategory(
    notification: Notification,
  ): boolean {
    if (!this.isInstructor) {
      return true;
    }

    const category =
      this.filters.inboxCategory || 'all';

    if (category === 'all') {
      return true;
    }

    const isAction =
      isInstructorOperationalNotification(
        notification,
      );

    if (category === 'action') {
      return isAction;
    }

    return !isAction;
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
    return this.inboxUnreadCount;
  }

  get readNotificationsCount(): number {
    return Math.max(
      0,
      this.total - this.inboxUnreadCount
    );
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

  private showFeedbackModal(options: {
    title: string;
    message: string;
    isSuccess?: boolean;
    isError?: boolean;
  }): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      title: options.title,
      message: options.message,
      isSuccess: !!options.isSuccess,
      isError: !!options.isError,
      close: () => {
        this.modal.show = false;
      },
    };
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