import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { Router } from '@angular/router';

import { NotificationService } from '../../../../services/notification.service';
import { selectUserData } from '../../../../store/user.selector';
import { UserDto } from '../../../../services/dtos/user.dto';
import {
  Notification as AppNotification,
  NotificationListResponse
} from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-notifications-sent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-sent.component.html',
  styleUrl: './notifications-sent.component.scss'
})
export class NotificationsSentComponent implements OnInit {
  Math = Math;
  private currentUserId: number | null = null;

  items: AppNotification[] = [];
  total = 0;
  page = 1;
  limit = 20;

  // Filtros
  showFilters = false;
  fromDate = '';
  toDate = '';

  constructor(
    private store: Store,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const daysAgo = new Date(today);
    daysAgo.setDate(today.getDate() - 30);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.fromDate = daysAgo.toISOString().slice(0, 10);
    this.toDate = tomorrow.toISOString().slice(0, 10);

    this.store.select(selectUserData)
      .pipe(filter((u): u is UserDto => !!u))
      .subscribe((u: UserDto) => {
        this.currentUserId = u.id;
        this.fetch();
      });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onFilterChange(): void {
    this.page = 1;
    this.fetch();
  }

  fetch(): void {
    if (!this.currentUserId) return;

    this.notificationService
      .getNotifications({
        fromUserId: this.currentUserId,
        page: this.page,
        limit: this.limit,
        fromDate: this.fromDate || undefined,
        toDate: this.toDate || undefined,
      })
      .subscribe((res) => {
        const r = res as NotificationListResponse;
        this.items = this.sortNotifications(r.notifications || []);
        this.total = r.total ?? this.items.length;
      });
  }

  private sortNotifications(notifications: AppNotification[]): AppNotification[] {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.sentAt || a.createdAt).getTime();
      const dateB = new Date(b.sentAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  get startIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endIndex(): number {
    return Math.min(this.page * this.limit, this.total);
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

  trackById(index: number, n: AppNotification) {
    return n.id;
  }

  onRowClick(notification: AppNotification): void {
    this.router.navigate(
      ['/dashboard/notifications-detail'],
      { state: { notification, origin: 'sent' } }
    );
  }
}