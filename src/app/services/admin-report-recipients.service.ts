import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminReportRecipientSource = 'USER' | 'EXTERNAL';

export interface AdminReportRecipientUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailAddress: string | null;
  role: string;
  status: string;
}

export interface AdminReportRecipient {
  id: number;
  source: AdminReportRecipientSource;
  userId: number | null;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AdminReportRecipientUser | null;
}

@Injectable({ providedIn: 'root' })
export class AdminReportRecipientsService {
  private readonly apiUrl = `${environment.apiUrl}/admin-report-recipients`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<AdminReportRecipient[]> {
    return this.http.get<AdminReportRecipient[]>(this.apiUrl);
  }

  addUsers(userIds: number[]): Observable<AdminReportRecipient[]> {
    return this.http.post<AdminReportRecipient[]>(`${this.apiUrl}/users`, {
      userIds,
    });
  }

  addExternal(
    email: string,
    displayName?: string,
  ): Observable<AdminReportRecipient> {
    return this.http.post<AdminReportRecipient>(`${this.apiUrl}/external`, {
      email,
      displayName: displayName || undefined,
    });
  }

  remove(id: number): Observable<{ deleted: true }> {
    return this.http.delete<{ deleted: true }>(`${this.apiUrl}/${id}`);
  }
}
