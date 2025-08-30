import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateNotificationDto,
  FilterNotificationDto,
   Notification
} from './dtos/notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  create(createData: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}`, createData);
  }

  getNotifications(filters: FilterNotificationDto): Observable<Notification[]> {
    let params = new HttpParams();

    if (filters.notificationType) {
      params = params.set('notificationType', filters.notificationType);
    }
    if (filters.scope) {
      params = params.set('scope', filters.scope);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority !== undefined) {
      params = params.set('priority', filters.priority.toString());
    }
    if (filters.userId !== undefined) {
      params = params.set('userId', filters.userId.toString());
    }
    if (filters.fromUserId !== undefined) {
      params = params.set('fromUserId', filters.fromUserId.toString());
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.unreadOnly !== undefined) {
      params = params.set('unreadOnly', filters.unreadOnly.toString());
    }
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<Notification[]>(this.apiUrl, { params });
  }
}
