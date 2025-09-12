import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!isOnline" class="offline-indicator">
      <div class="offline-content">
        <i class="material-icons">wifi_off</i>
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f44336;
      color: white;
      padding: 8px 16px;
      text-align: center;
      z-index: 1001;
      animation: slideDown 0.3s ease-out;
    }

    .offline-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .offline-content i {
      font-size: 18px;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOnline = true;
  private onlineSubscription?: Subscription;

  constructor(private pwaService: PwaService) {}

  ngOnInit() {
    this.isOnline = this.pwaService.isOnline();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  ngOnDestroy() {
    if (this.onlineSubscription) {
      this.onlineSubscription.unsubscribe();
    }
  }
}
