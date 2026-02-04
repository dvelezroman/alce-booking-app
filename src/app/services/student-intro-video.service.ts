import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentIntroVideoService {

  private buildKey(userId: number): string {
    return `student-intro-video-seen-${userId}`;
  }

  /** ¿Este usuario ya vio el video? */
  hasSeenVideo(userId: number): boolean {
    return this.getCookie(this.buildKey(userId)) === 'true';
  }

  /** Marca el video como visto para ESTE usuario */
  markAsSeen(userId: number): void {
    // cookie sin expiración real (muy lejana)
    document.cookie =
      `${this.buildKey(userId)}=true;path=/;SameSite=Lax`;
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