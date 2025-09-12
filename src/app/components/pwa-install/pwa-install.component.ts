import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install.component.html',
  styleUrls: ['./pwa-install.component.scss']
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