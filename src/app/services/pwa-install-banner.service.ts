import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class PwaInstallBannerService {
  private showBannerSubject = new BehaviorSubject<boolean>(false);
  public showBanner$ = this.showBannerSubject.asObservable();

  private deferredPrompt: any = null;

  constructor(private usersService: UsersService) {
    this.initializeInstallPrompt();
  }

  private initializeInstallPrompt(): void {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.checkAndShowBanner();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.hideBanner();
      this.setDontShowAgain(true);

      this.usersService.logout();
      window.location.href = '/login';
    });
  }

  private checkAndShowBanner(): void {
    const dontShowAgain = this.getDontShowAgain();
    const isStandalone = this.isStandalone();
    const isMobile = this.isMobile();
    
    // Show banner if:
    // 1. User hasn't chosen "don't show again"
    // 2. Not already running as PWA
    // 3. On mobile device
    // 4. Can install PWA
    const shouldShow = !dontShowAgain && !isStandalone && isMobile && this.canInstall();
    
    this.showBannerSubject.next(shouldShow);
  }

  canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    
    if (result.outcome === 'accepted') {
      this.hideBanner();
      return true;
    }
    
    return false;
  }

  hideBanner(): void {
    this.showBannerSubject.next(false);
  }

  setDontShowAgain(value: boolean): void {
    if (value) {
      this.setCookie('pwa-install-dont-show', 'true', 365);
    } else {
      this.deleteCookie('pwa-install-dont-show');
    }
  }

  getDontShowAgain(): boolean {
    return this.getCookie('pwa-install-dont-show') === 'true';
  }

  private isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}
