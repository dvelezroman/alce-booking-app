import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification.service';
import { FilterNotificationDto, Notification } from '../../../../services/dtos/notification.dto';

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
  typeFilter: Notification['notificationType'] | '' = '';
  scopeFilter: Notification['scope'] | '' = '';
  showFilters = false;

  fromDate: string = '';
  toDate: string = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.fromDate = today;
    this.toDate = today;
    this.fetchNotifications();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  fetchNotifications(): void {
    const filters: FilterNotificationDto = {
      fromDate: this.fromDate,
      toDate: this.toDate,
    };

    if (this.statusFilter) {
      filters.status = this.statusFilter;
    }

    if (this.scopeFilter) {
      filters.scope = this.scopeFilter;
    }

    if (this.typeFilter) {
      filters.notificationType = this.typeFilter;
    }

    this.notificationService.getNotifications(filters).subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
      },
    });
  }
}