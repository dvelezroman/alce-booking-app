import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import {
  FilterNotificationDto,
  Notification,
} from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-notifications-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications-status.component.html',
  styleUrl: './notifications-status.component.scss',
})
export class NotificationsStatusComponent implements OnInit {
  notifications: Notification[] = [];
  statusFilter: 'SENT' | 'PENDING' | 'DELIVERED' | 'READ' | 'FAILED' | '' = '';
  loading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.loading = true;
    const filters: FilterNotificationDto = {};

    if (this.statusFilter) {
      filters.status = this.statusFilter;
    }

    this.notificationService.getNotifications(filters).subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.loading = false;
      },
    });
  }
}
