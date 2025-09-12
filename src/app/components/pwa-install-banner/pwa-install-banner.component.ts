import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PwaInstallBannerService } from '../../services/pwa-install-banner.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pwa-install-banner.component.html',
  styleUrls: ['./pwa-install-banner.component.scss']
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
    // Aquí puedes limpiar subscripciones si agregas más
  }

  installPWA(): void {
    this.pwaInstallBannerService.installPWA().then(success => {
      if (!success) {
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