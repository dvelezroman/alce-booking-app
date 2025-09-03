import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { NotificationService } from '../../../../services/notification.service';
import { selectUserData } from '../../../../store/user.selector';
import { UserDto } from '../../../../services/dtos/user.dto';
import {
  Notification as AppNotification,
  NotificationListResponse
} from '../../../../services/dtos/notification.dto';
import { SentListComponent } from '../../../../components/notifications/sent-list/sent-list.component';

@Component({
  selector: 'app-notifications-sent',
  standalone: true,
  imports: [CommonModule, SentListComponent],
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

  constructor(
    private store: Store,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData)
      .pipe(filter((u): u is UserDto => !!u))
      .subscribe((u: UserDto) => {
        this.currentUserId = u.id;
        this.fetch();
      });
  }

  fetch(): void {
    if (!this.currentUserId) return;

    this.notificationService
      .getNotifications({
        fromUserId: this.currentUserId,
        userId: this.currentUserId,
        //fromUserId: this.currentUserId,
        page: this.page,
        limit: this.limit
      })
      .subscribe((res) => {
        const r = res as NotificationListResponse;
        this.items = (r.notifications || []) as AppNotification[];
        this.total = r.total ?? this.items.length;
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
}