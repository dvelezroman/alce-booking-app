import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { NotificationCountService } from '../../services/notification-count.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-badge" *ngIf="unreadCount > 0">
      <span class="badge-count">{{ unreadCount }}</span>
    </div>
  `,
  styles: [`
    .notification-badge {
      position: relative;
      display: inline-block;
    }
    
    .badge-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #ff4444;
      color: white;
      border-radius: 50%;
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      padding: 2px 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `]
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private subscription: Subscription = new Subscription();

  constructor(private notificationCountService: NotificationCountService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationCountService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
