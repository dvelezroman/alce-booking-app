import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { UsersService } from './users.service';
import { environment } from '../../environments/environment';

const PROMPT_PUSH_AFTER_UPDATE_KEY = 'alce.push.prompt-after-update';
const UPDATE_DISMISS_SESSION_KEY = 'alce.pwa.update-dismissed';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  private swUpdate?: SwUpdate;
  private readonly updateAvailableSubject = new BehaviorSubject(false);
  readonly updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor(private usersService: UsersService) {}

  setSwUpdate(swUpdate: SwUpdate) {
    this.swUpdate = swUpdate;
    if (swUpdate && swUpdate.isEnabled) {
      swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailableSubject.next(true);
        });

      swUpdate.unrecoverable.subscribe(() => {
        this.updateAvailableSubject.next(true);
      });
    }

    void this.detectLegacyServiceWorker();
  }

  /**
   * Old PWAs may still be controlled by custom-sw.js (dual-SW era).
   * New push needs ngsw (or a fresh custom-sw). Ask user to update.
   */
  private async detectLegacyServiceWorker(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(UPDATE_DISMISS_SESSION_KEY)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const script = registration?.active?.scriptURL || '';
      const legacyCustomSw =
        environment.production && script.includes('custom-sw.js');
      if (legacyCustomSw) {
        this.updateAvailableSubject.next(true);
      }
    } catch {
      // ignore
    }
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailableSubject.value;
  }

  dismissUpdateBanner(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(UPDATE_DISMISS_SESSION_KEY, '1');
    }
    this.updateAvailableSubject.next(false);
  }

  markPromptPushAfterUpdate(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(PROMPT_PUSH_AFTER_UPDATE_KEY, 'true');
    }
  }

  consumePromptPushAfterUpdate(): boolean {
    if (typeof sessionStorage === 'undefined') {
      return false;
    }
    const flagged = sessionStorage.getItem(PROMPT_PUSH_AFTER_UPDATE_KEY) === 'true';
    sessionStorage.removeItem(PROMPT_PUSH_AFTER_UPDATE_KEY);
    return flagged;
  }

  async applyPendingUpdate(): Promise<void> {
    this.markPromptPushAfterUpdate();

    if (this.swUpdate?.isEnabled) {
      try {
        await this.swUpdate.activateUpdate();
      } catch (error) {
        console.error('Error activating PWA update:', error);
      }
    }

    await this.unregisterLegacyCustomSw();
    window.location.reload();
  }

  private async unregisterLegacyCustomSw(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((reg) => reg.active?.scriptURL.includes('custom-sw.js'))
        .map((reg) => reg.unregister()),
    );
  }

  public async checkForUpdates(): Promise<void> {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      return;
    }

    try {
      await this.swUpdate.checkForUpdate();
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  public setupPeriodicUpdates(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          void this.checkForUpdates();
        }, 2000);
      }
    });

    window.addEventListener('online', () => {
      setTimeout(() => {
        void this.checkForUpdates();
      }, 2000);
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
