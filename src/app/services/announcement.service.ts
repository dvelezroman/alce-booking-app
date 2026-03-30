import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Announcement } from './dtos/announcement.dto';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {

  private apiUrl = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient) {}

  // =========================
  // 🔹 GET (usuario actual)
  // =========================
  getAnnouncementsForMe(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/for-me`);
  }

  // =========================
  // 🔹 GET (admin)
  // =========================
  getAllAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}`);
  }

  // =========================
  // 🔹 CREATE
  // =========================
  createAnnouncement(payload: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}`, payload);
  }

  // =========================
  // 🔹 UPDATE
  // =========================
  updateAnnouncement(id: string, payload: Partial<Announcement>): Observable<Announcement> {
    return this.http.patch<Announcement>(`${this.apiUrl}/${id}`, payload);
  }

  // =========================
  // 🔹 DELETE
  // =========================
  deleteAnnouncement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}