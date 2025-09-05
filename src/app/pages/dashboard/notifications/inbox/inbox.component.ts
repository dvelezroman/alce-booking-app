import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InboxFiltersComponent } from '../../../../components/notifications/inbox/inbox-filters/inbox-filters.component';
import { NotificationService } from '../../../../services/notification.service';
import { Notification } from '../../../../services/dtos/notification.dto';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
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
  limit = 20;
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

    this.store.select(selectUserData).pipe(take(1)).subscribe((u: UserDto | null) => {
      this.currentUserId = u?.id ?? null;
      this.fetchNotifications();
    });
  }

  onReadDaysChange(days: number) {
    this.readDays = days;
    this.page = 1; // reinicia a la primera página cuando cambian los filtros
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
        this.total = res.total || this.notifications.length || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('[Inbox] error:', err);
        this.errorMsg = 'No se pudieron cargar las notificaciones.';
        this.loading = false;
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

  trackById(index: number, n: Notification): number {
    return n.id;
  }

  onRowClick(n: Notification) {
    if (!n?.id) return;

    const go = () =>
      this.router.navigate(
        ['/dashboard/notifications-detail'],
        { state: { notification: n } }
      );

    if (n.isRead) { go(); return; }

    this.notificationService.markSingleAsRead(n.id).subscribe({
      next: () => go(),
      error: () => go(),
    });
  }
}