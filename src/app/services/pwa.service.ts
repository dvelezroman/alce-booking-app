import { Injectable, Optional } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  private swUpdate?: SwUpdate;

  constructor(private usersService: UsersService) {
    // Service worker will be injected when available
  }

  setSwUpdate(swUpdate: SwUpdate) {
    this.swUpdate = swUpdate;
    if (swUpdate && swUpdate.isEnabled) {
      // Handle version updates
      swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
          map((evt: VersionReadyEvent) => ({
            type: 'UPDATE_AVAILABLE',
            current: evt.currentVersion,
            available: evt.latestVersion,
          })),
          catchError(error => {
            console.error('Error checking for updates:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          // Automatically activate the new version without user confirmation
          console.log('New version available, activating automatically...');
          swUpdate.activateUpdate().then(() => {
            window.location.reload();
          });
        });
    }
  }

  /**
   * Check for updates in a stable way (no infinite loops)
   */
  public async checkForUpdates(): Promise<void> {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      return;
    }

    try {
      // Only check if we haven't checked recently
      const lastCheck = localStorage.getItem('lastUpdateCheck');
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);

      if (!lastCheck || parseInt(lastCheck) < oneHourAgo) {
        console.log('Checking for updates...');
        await this.swUpdate.checkForUpdate();
        localStorage.setItem('lastUpdateCheck', now.toString());
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  /**
   * Set up stable periodic update checks (no infinite loops)
   */
  public setupPeriodicUpdates(): void {
    // Check for updates when the page becomes visible (but not too often)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Add a small delay to prevent rapid checks
        setTimeout(() => {
          this.checkForUpdates();
        }, 5000); // 5 second delay
      }
    });

    // Check for updates when the app comes back online
    window.addEventListener('online', () => {
      setTimeout(() => {
        this.checkForUpdates();
      }, 2000); // 2 second delay
    });
  }

  public initPwaPrompt() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.promptEvent = event;
    });

    window.addEventListener('appinstalled', () => {
      this.usersService.logout();
      window.location.href = '/login';
    });
  }

  public async installPwa(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    this.promptEvent.prompt();
    const result = await this.promptEvent.userChoice;
    this.promptEvent = null;

    if (result.outcome === 'accepted') {
      this.usersService.logout();
      window.location.href = '/login';
      return true;
    }

    return false;
  }

  public canInstall(): boolean {
    return !!this.promptEvent;
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Check if push notifications are supported
   */
  isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /**
   * Get notification permission status
   */
  getNotificationPermission(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }
}
