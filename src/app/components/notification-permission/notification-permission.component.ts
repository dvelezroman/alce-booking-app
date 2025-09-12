import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-notification-permission',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPermissionBanner" class="notification-permission-banner">
      <div class="notification-permission-content">
        <div class="notification-permission-icon">
          <i class="material-icons">notifications</i>
        </div>
        <div class="notification-permission-text">
          <h4>Recibe notificaciones</h4>
          <p>Mantente al día con tus clases y notificaciones importantes</p>
        </div>
        <div class="notification-permission-actions">
          <button 
            class="button is-primary is-small" 
            (click)="enableNotifications()"
            [disabled]="isLoading">
            <span *ngIf="!isLoading">Activar</span>
            <span *ngIf="isLoading" class="loading-spinner"></span>
          </button>
          <button 
            class="button is-small" 
            (click)="dismissBanner()">
            Ahora no
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="showSuccessMessage" class="notification-success-message">
      <div class="notification-success-content">
        <i class="material-icons">check_circle</i>
        <span>¡Notificaciones activadas! Recibirás alertas sobre nuevas notificaciones.</span>
        <button class="button is-small is-text" (click)="dismissSuccess()">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-permission-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideDown 0.3s ease-out;
    }

    .notification-permission-content {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .notification-permission-icon {
      flex-shrink: 0;
    }

    .notification-permission-icon i {
      font-size: 24px;
      color: #fff;
    }

    .notification-permission-text {
      flex: 1;
    }

    .notification-permission-text h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .notification-permission-text p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .notification-permission-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .notification-permission-actions .button {
      border-radius: 6px;
      font-size: 12px;
      padding: 8px 16px;
    }

    .loading-spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .notification-success-message {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      animation: slideInRight 0.3s ease-out;
    }

    .notification-success-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-success-content i {
      font-size: 20px;
    }

    .notification-success-content span {
      font-size: 14px;
      flex: 1;
    }

    .notification-success-content .button {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .notification-permission-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }
      
      .notification-permission-actions {
        width: 100%;
        justify-content: center;
      }
      
      .notification-success-message {
        top: 10px;
        right: 10px;
        left: 10px;
      }
    }
  `]
})
export class NotificationPermissionComponent implements OnInit, OnDestroy {
  showPermissionBanner = false;
  showSuccessMessage = false;
  isLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(private pushNotificationService: PushNotificationService) {}

  ngOnInit() {
    // Check if notifications are supported
    if (!this.pushNotificationService.isSupported()) {
      return;
    }

    // Check permission status
    this.subscriptions.push(
      this.pushNotificationService.permission$.subscribe(permission => {
        if (permission === 'default') {
          this.showPermissionBanner = true;
        } else if (permission === 'granted') {
          this.showPermissionBanner = false;
        }
      })
    );

    // Check subscription status
    this.subscriptions.push(
      this.pushNotificationService.isSubscribed().subscribe(isSubscribed => {
        if (isSubscribed) {
          this.showPermissionBanner = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async enableNotifications() {
    this.isLoading = true;
    
    try {
      const subscription = await this.pushNotificationService.subscribeToPush();
      
      if (subscription) {
        this.showPermissionBanner = false;
        this.showSuccessMessage = true;
        
        // Start periodic notification checks
        this.pushNotificationService.startPeriodicNotificationCheck(5);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.dismissSuccess();
        }, 5000);
      } else {
        console.warn('Failed to subscribe to push notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  dismissBanner() {
    this.showPermissionBanner = false;
    // Store dismissal to avoid showing again for a while
    localStorage.setItem('notification-permission-dismissed', Date.now().toString());
  }

  dismissSuccess() {
    this.showSuccessMessage = false;
  }
}
