import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxFiltersComponent } from '../../../../components/notifications/inbox/inbox-filters/inbox-filters.component';
import { NotificationService } from '../../../../services/notification.service';
import { Notification } from '../../../../services/dtos/notification.dto';
import { Router } from '@angular/router';
import { Observable, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../../store/user.selector';
import { UserDto } from '../../../../services/dtos/user.dto';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, InboxFiltersComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss',
})
export class InboxComponent implements OnInit {
  private currentUserId: number | null = null;

  notifications: Notification[] = [];
  unreadCount$!: Observable<number>;

  page = 1;
  limit = 30;
  total = 0;

  readDays = 30;

  loading = false;
  errorMsg = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.unreadCount$ = this.notificationService.unreadCount$;

    const r = this.last30DaysRange();

    this.store.select(selectUserData).pipe(take(1)).subscribe((u: UserDto | null) => {
      this.currentUserId = u?.id ?? null;
      this.fetchNotifications();
    });
  }

  private last30DaysRange(): { fromDate: string; toDate: string } {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return { fromDate: from.toISOString(), toDate: to.toISOString() };
  }

  onReadDaysChange(days: number) {
    this.readDays = days;
    this.page = 1;
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    this.errorMsg = '';

    this.notificationService.getUserNotifications({
      page: this.page,
      limit: this.limit,
      readDays: this.readDays,
    }).subscribe({
      next: (res) => {
        this.notifications = (res.notifications || [])
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        this.total = res.total || 0;
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

  // isUnread(n: Notification): boolean {
  //   if (n.isRead === true)  return false;
  //   if (n.isRead === false) return true;
  //   if (this.currentUserId == null) {
  //     return !(n.readBy && n.readBy.length > 0);
  //   }
  //   return !n.readBy?.includes(this.currentUserId);
  // }

  onRowClick(n: Notification) {
    if (!n?.id) return;

    this.notificationService.markSingleAsRead(n.id).pipe(
      switchMap(() => this.notificationService.getNotificationById(n.id))
    ).subscribe({
      next: (full) => {
        this.router.navigate(['/dashboard/notifications-detail'], { state: { notification: full } });
      },
      error: (err) => {
        console.error('[Inbox] Error mark/get →', err);
        this.router.navigate(['/dashboard/notifications-inbox']);
      }
    });
  }
}