import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateNotificationDto,
  FilterNotificationDto,
  Notification,
  NotificationListResponse,
} from './dtos/notification.dto';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  create(createData: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}`, createData);
  }

  getNotifications(filters: FilterNotificationDto): Observable<Notification[] | NotificationListResponse> {
    let params = new HttpParams();

    if (filters.notificationType) params = params.set('notificationType', filters.notificationType);
    if (filters.scope)            params = params.set('scope', filters.scope);
    if (filters.status)           params = params.set('status', filters.status);
    if (filters.priority != null) params = params.set('priority', String(filters.priority));
    if (filters.userId != null)   params = params.set('userId', String(filters.userId));
    if (filters.fromUserId != null) params = params.set('fromUserId', String(filters.fromUserId));
    if (filters.fromDate)         params = params.set('fromDate', filters.fromDate);
    if (filters.toDate)           params = params.set('toDate', filters.toDate);
    if (filters.unreadOnly != null) params = params.set('unreadOnly', String(filters.unreadOnly));
    if (filters.page != null)     params = params.set('page', String(filters.page));
    if (filters.limit != null)    params = params.set('limit', String(filters.limit));

    return this.http.get<Notification[] | NotificationListResponse>(this.apiUrl, { params });
  }

  getUserNotifications(opts?: { readDays?: number; page?: number; limit?: number; })
    : Observable<NotificationListResponse> {
    let params = new HttpParams();

    if (opts?.readDays != null) params = params.set('readDays', String(opts.readDays));
    if (opts?.page != null)     params = params.set('page', String(opts.page));
    if (opts?.limit != null)    params = params.set('limit', String(opts.limit));

    return this.http.get<NotificationListResponse>(`${this.apiUrl}/user`, { params });
  }
}