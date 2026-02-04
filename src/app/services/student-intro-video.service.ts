import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentIntroVideoService {

  private readonly STORAGE_KEY = 'student-intro-video-seen';

  /** ¿El estudiante ya vio el video? */
  hasSeenVideo(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  /** Marca el video como visto */
  markAsSeen(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  /** (opcional) reset para pruebas */
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}