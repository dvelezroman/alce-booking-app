import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StudentIntroVideoService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = () => isPlatformBrowser(this.platformId);

  private readonly COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

  private buildKey(userId: number): string {
    return `student-intro-video-seen-${userId}`;
  }

  /** ¿Este usuario ya vio el video? */
  hasSeenVideo(userId: number): boolean {
    if (!this.isBrowser()) return false;

    const key = this.buildKey(userId);

    // 1. Check localStorage first (more reliable on mobile/PWA)
    const fromStorage = localStorage.getItem(key);
    if (fromStorage === 'true') return true;

    // 2. Fallback to cookie
    return this.getCookie(key) === 'true';
  }

  /** Marca el video como visto para ESTE usuario */
  markAsSeen(userId: number): void {
    if (!this.isBrowser()) return;

    const key = this.buildKey(userId);

    // 1. localStorage (primary - persists across sessions on mobile/PWA)
    try {
      localStorage.setItem(key, 'true');
    } catch {
      // Quota exceeded or private mode - continue with cookie only
    }

    // 2. Cookie with max-age (persistent, fallback)
    document.cookie =
      `${key}=true;path=/;max-age=${this.COOKIE_MAX_AGE};SameSite=Lax`;
  }

  /* ============================
     COOKIE HELPERS
     ============================ */

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let c of cookies) {
      c = c.trim();
      if (c.startsWith(nameEQ)) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }
}
