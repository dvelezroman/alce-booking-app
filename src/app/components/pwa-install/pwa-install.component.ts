import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showInstallButton" class="pwa-install-banner">
      <div class="pwa-install-content">
        <div class="pwa-install-text">
          <i class="material-icons">get_app</i>
          <span>Install Alce Booking App for a better experience</span>
        </div>
        <div class="pwa-install-buttons">
          <button class="button is-primary is-small" (click)="installApp()">
            Install
          </button>
          <button class="button is-small" (click)="dismissInstall()">
            Not now
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pwa-install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      padding: 12px 16px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    }

    .pwa-install-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }

    .pwa-install-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .pwa-install-text i {
      font-size: 20px;
    }

    .pwa-install-buttons {
      display: flex;
      gap: 8px;
    }

    .pwa-install-buttons .button {
      border-radius: 6px;
      font-size: 12px;
      padding: 6px 12px;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .pwa-install-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
      
      .pwa-install-text {
        font-size: 13px;
      }
    }
  `]
})
export class PwaInstallComponent implements OnInit {
  showInstallButton = false;

  constructor(private pwaService: PwaService) {}

  ngOnInit() {
    this.pwaService.initPwaPrompt();
    
    // Show install button if PWA can be installed and not already installed
    if (this.pwaService.canInstall() && !this.pwaService.isStandalone()) {
      this.showInstallButton = true;
    }
  }

  async installApp() {
    const installed = await this.pwaService.installPwa();
    if (installed) {
      this.showInstallButton = false;
    }
  }

  dismissInstall() {
    this.showInstallButton = false;
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }
}
