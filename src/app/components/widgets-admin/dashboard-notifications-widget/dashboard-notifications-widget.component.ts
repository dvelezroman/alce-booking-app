import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../services/dtos/notification.dto';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../../store/user.selector';
import { UserDto } from '../../../services/dtos/user.dto';
import { take } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-notifications-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-notifications-widget.component.html',
  styleUrl: './dashboard-notifications-widget.component.scss',
})
export class DashboardNotificationsWidgetComponent implements OnInit {

  notifications: Notification[] = [];

  loading = false;

  constructor(
    private notificationService: NotificationService,
    private store: Store
  ) {}

  ngOnInit(): void {

    this.store.select(selectUserData)
      .pipe(take(1))
      .subscribe((u: UserDto | null) => {

        if (!u?.id) return;

        this.fetchNotifications();

      });

  }

  fetchNotifications() {

    this.loading = true;

    this.notificationService.getUserNotifications({
      page: 1,
      limit: 3,
      readDays: 30
    }).subscribe({

      next: (res) => {

        this.notifications = (res.notifications || [])
          .sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          )
          .slice(0, 3);

        this.loading = false;

      },

      error: () => {
        this.notifications = [];
        this.loading = false;
      }

    });

  }

}