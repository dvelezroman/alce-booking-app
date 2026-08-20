import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EmailMatchField = 'email' | 'emailAddress' | 'tutorEmail';
export type EmailSuppressionSource =
  | 'SEND_FAILURE'
  | 'MANUAL'
  | 'INVALID_ADDRESS';

export interface MatchedUser {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  status?: string | null;
  matchField: EmailMatchField;
}

export interface EmailSuppression {
  id: number;
  email: string;
  reason?: string | null;
  source: EmailSuppressionSource;
  active: boolean;
  lastErrorAt?: string | null;
  suppressedAt: string;
  liftedAt?: string | null;
  lastNotifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  matchedUsers: MatchedUser[];
}

export interface EmailSuppressionsListResponse {
  items: EmailSuppression[];
  total: number;
  page: number;
  limit: number;
}

export interface FilterEmailSuppressions {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface CreateEmailSuppressionPayload {
  email: string;
  reason?: string;
}

export interface UpdateEmailSuppressionPayload {
  email?: string;
  reason?: string;
  active?: boolean;
}

export interface NotifyEmailSuppressionPayload {
  userIds?: number[];
  title?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class EmailSuppressionService {
  private apiUrl = `${environment.apiUrl}/email-suppressions`;

  constructor(private http: HttpClient) {}

  list(
    filters: FilterEmailSuppressions = {},
  ): Observable<EmailSuppressionsListResponse> {
    let params = new HttpParams();
    if (filters.page != null) params = params.set('page', String(filters.page));
    if (filters.limit != null)
      params = params.set('limit', String(filters.limit));
    if (filters.search) params = params.set('search', filters.search);
    if (filters.active !== undefined && filters.active !== null) {
      params = params.set('active', String(filters.active));
    }
    return this.http.get<EmailSuppressionsListResponse>(this.apiUrl, {
      params,
    });
  }

  getById(id: number): Observable<EmailSuppression> {
    return this.http.get<EmailSuppression>(`${this.apiUrl}/${id}`);
  }

  create(
    payload: CreateEmailSuppressionPayload,
  ): Observable<EmailSuppression> {
    return this.http.post<EmailSuppression>(this.apiUrl, payload);
  }

  update(
    id: number,
    payload: UpdateEmailSuppressionPayload,
  ): Observable<EmailSuppression> {
    return this.http.patch<EmailSuppression>(`${this.apiUrl}/${id}`, payload);
  }

  lift(id: number): Observable<EmailSuppression> {
    return this.http.delete<EmailSuppression>(`${this.apiUrl}/${id}`);
  }

  notify(
    id: number,
    payload: NotifyEmailSuppressionPayload = {},
  ): Observable<{
    notifiedUserIds: number[];
    notificationId: number;
    lastNotifiedAt: string;
  }> {
    return this.http.post<{
      notifiedUserIds: number[];
      notificationId: number;
      lastNotifiedAt: string;
    }>(`${this.apiUrl}/${id}/notify`, payload);
  }
}
