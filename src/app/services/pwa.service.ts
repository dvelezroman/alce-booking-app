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
      // Check for updates immediately when service worker is available
      this.checkForUpdates();

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

      // Check for updates on app startup (for existing users)
      this.checkForUpdatesOnStartup();
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
   * Check if user has a very old version and force complete update
   */
  public async checkForLegacyVersion(): Promise<void> {
    try {
      const appVersion = localStorage.getItem('appVersion');
      const currentVersion = this.getCurrentAppVersion();
      
      // If no version stored or very old version, force complete update
      if (!appVersion || this.isLegacyVersion(appVersion)) {
        console.log('Legacy version detected, forcing complete update...');
        await this.forceCompleteUpdate();
        localStorage.setItem('appVersion', currentVersion);
      }
    } catch (error) {
      console.error('Error checking for legacy version:', error);
    }
  }

  /**
   * Get current app version from package.json or manifest
   */
  private getCurrentAppVersion(): string {
    // Try to get version from environment or use build timestamp
    try {
      // You can set this in environment.ts or get from build process
      const buildTime = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      return buildTime;
    } catch {
      // Fallback to timestamp
      return Date.now().toString();
    }
  }

  /**
   * Check if version is legacy (older than 24 hours)
   */
  private isLegacyVersion(version: string): boolean {
    try {
      const versionTime = parseInt(version);
      const currentTime = Date.now();
      const oneDayAgo = currentTime - (24 * 60 * 60 * 1000);
      return versionTime < oneDayAgo;
    } catch {
      return true; // If version can't be parsed, consider it legacy
    }
  }

  /**
   * Force complete update for legacy versions
   */
  private async forceCompleteUpdate(): Promise<void> {
    try {
      console.log('Forcing complete update for legacy version...');
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear IndexedDB
      await this.clearIndexedDB();
      
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }
      
      // Force reload to get fresh version
      window.location.reload();
      
    } catch (error) {
      console.error('Error forcing complete update:', error);
      // As fallback, just reload
      window.location.reload();
    }
  }

  /**
   * Check for updates on app startup (for existing users with old versions)
   */
  private async checkForUpdatesOnStartup(): Promise<void> {
    try {
      // Check if this is an existing user with an old version
      const lastUpdateCheck = localStorage.getItem('lastUpdateCheck');
      const currentTime = Date.now();
      const oneHourAgo = currentTime - (60 * 60 * 1000);

      // If it's been more than an hour since last check, or never checked
      if (!lastUpdateCheck || parseInt(lastUpdateCheck) < oneHourAgo) {
        console.log('Checking for updates on startup (existing user)...');
        
        // Force a fresh check for updates
        await this.checkForUpdates();
        
        // Update the last check time
        localStorage.setItem('lastUpdateCheck', currentTime.toString());
      }

      // Also check if service worker is outdated
      await this.checkServiceWorkerVersion();
      
    } catch (error) {
      console.error('Error checking for updates on startup:', error);
    }
  }

  /**
   * Check if service worker version is outdated
   */
  private async checkServiceWorkerVersion(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          // Check if service worker is controlling the page
          if (!registration.active || !navigator.serviceWorker.controller) {
            console.log('Service worker not controlling page, forcing update...');
            await this.forceReRegister();
            return;
          }

          // Check if service worker is outdated by comparing with server
          const response = await fetch('/ngsw.json?t=' + Date.now(), { cache: 'no-cache' });
          if (response.ok) {
            const serverManifest = await response.json();
            const currentManifest = await this.getCurrentManifest();
            
            if (currentManifest && serverManifest.hash !== currentManifest.hash) {
              console.log('Service worker manifest outdated, forcing update...');
              await this.forceReRegister();
            }
          }
        } else {
          console.log('No service worker registration found, registering...');
          // Service worker not registered, it will be registered by Angular
        }
      }
    } catch (error) {
      console.error('Error checking service worker version:', error);
    }
  }

  /**
   * Get current service worker manifest
   */
  private async getCurrentManifest(): Promise<any> {
    try {
      const response = await fetch('/ngsw.json', { cache: 'no-cache' });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting current manifest:', error);
    }
    return null;
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

    // Check for updates when the app regains focus
    window.addEventListener('focus', () => {
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
