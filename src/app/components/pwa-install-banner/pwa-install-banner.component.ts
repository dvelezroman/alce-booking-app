import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PwaInstallBannerService } from '../../services/pwa-install-banner.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pwa-install-banner" *ngIf="showBanner">
      <div class="banner-content">
        <div class="banner-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
            <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" fill="currentColor"/>
            <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" fill="currentColor"/>
          </svg>
        </div>
        
        <div class="banner-text">
          <h3>📱 Instala la App</h3>
          <p>Instala Alce College como una app nativa en tu dispositivo para una mejor experiencia. No necesitarás el navegador y se actualiza automáticamente.</p>
        </div>
        
        <div class="banner-actions">
          <button class="btn-install" (click)="installPWA()" [disabled]="!canInstall">
            {{ canInstall ? 'Instalar' : 'No disponible' }}
          </button>
          <button class="btn-close" (click)="dismissBanner()">
            ✕
          </button>
        </div>
      </div>
      
      <div class="banner-footer">
        <label class="dont-show-again">
          <input type="checkbox" [(ngModel)]="dontShowAgain" (change)="onDontShowAgainChange()">
          <span>No mostrar de nuevo</span>
        </label>
      </div>
    </div>
  `,
  styles: [`
    .pwa-install-banner {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      max-width: 500px;
      margin: 0 auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .banner-content {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .banner-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .banner-text {
      flex: 1;
      min-width: 0;
    }

    .banner-text h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .banner-text p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.4;
    }

    .banner-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-install {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-install:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    .btn-install:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .banner-footer {
      padding: 0 16px 16px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      margin-top: 12px;
    }

    .dont-show-again {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      opacity: 0.8;
      cursor: pointer;
    }

    .dont-show-again input[type="checkbox"] {
      margin: 0;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .pwa-install-banner {
        left: 10px;
        right: 10px;
        bottom: 10px;
      }

      .banner-content {
        padding: 12px;
        gap: 8px;
      }

      .banner-text h3 {
        font-size: 15px;
      }

      .banner-text p {
        font-size: 13px;
      }

      .btn-install {
        padding: 6px 12px;
        font-size: 13px;
      }
    }

    /* Hide on very small screens */
    @media (max-width: 480px) {
      .banner-text p {
        display: none;
      }
    }
  `]
})
export class PwaInstallBannerComponent implements OnInit, OnDestroy {
  showBanner = false;
  canInstall = false;
  dontShowAgain = false;

  constructor(private pwaInstallBannerService: PwaInstallBannerService) {}

  ngOnInit(): void {
    // Subscribe to banner visibility
    this.pwaInstallBannerService.showBanner$.subscribe(show => {
      this.showBanner = show;
    });

    // Check if PWA can be installed
    this.canInstall = this.pwaInstallBannerService.canInstall();

    // Check if user previously chose "don't show again"
    this.dontShowAgain = this.pwaInstallBannerService.getDontShowAgain();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  installPWA(): void {
    this.pwaInstallBannerService.installPWA().then(success => {
      if (!success) {
        // Fallback for browsers that don't support beforeinstallprompt
        this.showInstallInstructions();
      }
    });
  }

  private showInstallInstructions(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = '';
    if (isIOS) {
      message = 'Para instalar en iOS: Toca el botón de compartir y selecciona "Agregar a pantalla de inicio"';
    } else if (isAndroid) {
      message = 'Para instalar en Android: Toca el menú del navegador y selecciona "Agregar a pantalla de inicio"';
    } else {
      message = 'Para instalar: Busca la opción "Instalar" en el menú del navegador';
    }
    
    alert(message);
  }

  dismissBanner(): void {
    this.pwaInstallBannerService.hideBanner();
  }

  onDontShowAgainChange(): void {
    this.pwaInstallBannerService.setDontShowAgain(this.dontShowAgain);
  }
}
