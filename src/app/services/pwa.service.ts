import { Injectable, Optional } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  private swUpdate?: SwUpdate;

  constructor() {
    // Service worker will be injected when available
  }

  setSwUpdate(swUpdate: SwUpdate) {
    this.swUpdate = swUpdate;
    if (swUpdate && swUpdate.isEnabled) {
      swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
          map(evt => ({
            type: 'UPDATE_AVAILABLE',
            current: evt.currentVersion,
            available: evt.latestVersion,
          }))
        )
        .subscribe(() => {
          if (confirm('New version available. Load New Version?')) {
            window.location.reload();
          }
        });
    }
  }

  public initPwaPrompt() {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.promptEvent = event;
    });
  }

  public async installPwa(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    this.promptEvent.prompt();
    const result = await this.promptEvent.userChoice;
    this.promptEvent = null;
    return result.outcome === 'accepted';
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
}
