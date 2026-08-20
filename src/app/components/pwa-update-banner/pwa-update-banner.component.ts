import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-update-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-update-banner.component.html',
  styleUrls: ['./pwa-update-banner.component.scss'],
})
export class PwaUpdateBannerComponent implements OnInit, OnDestroy {
  showBanner = false;
  isLoading = false;
  private sub?: Subscription;

  constructor(private pwaService: PwaService) {}

  ngOnInit(): void {
    this.sub = this.pwaService.updateAvailable$.subscribe((available) => {
      this.showBanner = available;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async acceptUpdate(): Promise<void> {
    this.isLoading = true;
    try {
      await this.pwaService.applyPendingUpdate();
    } finally {
      this.isLoading = false;
    }
  }

  dismiss(): void {
    this.pwaService.dismissUpdateBanner();
  }
}
