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
        .subscribe((updateInfo) => {
          if (updateInfo) {
            console.log('New version available, activating automatically...', updateInfo);
            this.activateUpdate();
          }
        });

      // Handle unrecoverable state
      swUpdate.unrecoverable
        .pipe(
          catchError(error => {
            console.error('Unrecoverable state error:', error);
            return of(null);
          })
        )
        .subscribe((event: any) => {
          if (event) {
            console.error('Unrecoverable state detected, re-registering service worker...');
            this.reRegisterServiceWorker();
          }
        });
    }
  }

  private async activateUpdate(): Promise<void> {
    if (!this.swUpdate) return;
    
    try {
      console.log('Activating service worker update...');
      await this.swUpdate.activateUpdate();
      console.log('Service worker update activated, reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('Error activating update:', error);
      // If activation fails, try to re-register the service worker
      this.reRegisterServiceWorker();
    }
  }

  private async reRegisterServiceWorker(): Promise<void> {
    try {
      console.log('Re-registering service worker...');
      
      // Unregister current service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          console.log('Unregistering service worker:', registration.scope);
          await registration.unregister();
        }
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      // Clear IndexedDB
      await this.clearIndexedDB();

      // Wait a bit before re-registering
      setTimeout(() => {
        console.log('Re-registering service worker after cleanup...');
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error re-registering service worker:', error);
      // As a last resort, force reload
      window.location.reload();
    }
  }

  private async clearIndexedDB(): Promise<void> {
    try {
      // Clear notification database
      if ('indexedDB' in window) {
        const dbNames = ['NotificationDB', 'ngsw-db'];
        for (const dbName of dbNames) {
          try {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            await new Promise((resolve, reject) => {
              deleteReq.onsuccess = () => resolve(true);
              deleteReq.onerror = () => reject(deleteReq.error);
            });
            console.log('Cleared IndexedDB:', dbName);
          } catch (error) {
            console.warn('Could not clear IndexedDB:', dbName, error);
          }
        }
      }
    } catch (error) {
      console.warn('Error clearing IndexedDB:', error);
    }
  }

  /**
   * Manually check for service worker updates
   */
  public async checkForUpdates(): Promise<void> {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      console.log('Service worker not available for updates');
      return;
    }

    try {
      console.log('Manually checking for updates...');
      await this.swUpdate.checkForUpdate();
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  /**
   * Force service worker re-registration
   */
  public async forceReRegister(): Promise<void> {
    console.log('Force re-registering service worker...');
    await this.reRegisterServiceWorker();
  }

  /**
   * Set up periodic update checks
   */
  public setupPeriodicUpdates(): void {
    // Check for updates every 30 minutes
    setInterval(() => {
      this.checkForUpdates();
    }, 30 * 60 * 1000);

    // Check for updates when the page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });

    // Check for updates when the app comes back online
    window.addEventListener('online', () => {
      this.checkForUpdates();
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
