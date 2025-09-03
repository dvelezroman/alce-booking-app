import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateNotificationDto,
  CreateNotificationsBulkDto,
  FilterNotificationDto,
  Notification,
  NotificationListResponse,
} from './dtos/notification.dto';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  create(createData: CreateNotificationDto): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}`, createData);
  }

  createBulk(payload: CreateNotificationsBulkDto): Observable<NotificationListResponse> {
    return this.http.post<NotificationListResponse>(`${this.apiUrl}/bulk`, payload);
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

  getUserNotifications(opts?: {
    readDays?: number;
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    status?: 'SENT' | 'PENDING' | 'DELIVERED' | 'READ' | 'FAILED';
    type?: string;
    scope?: string;
    priority?: 0 | 1 | 2 | 3;
    isRead?: boolean;
  }): Observable<NotificationListResponse> {
    let params = new HttpParams();

    const setIf = (key: string, val: unknown) => {
      if (val !== undefined && val !== '') {
        params = params.set(key, String(val));
      }
    };

    setIf('readDays', opts?.readDays);
    setIf('page',     opts?.page);
    setIf('limit',    opts?.limit);

    setIf('fromDate', opts?.fromDate);
    setIf('toDate',   opts?.toDate);

    setIf('status',   opts?.status);
    setIf('type',     opts?.type);
    setIf('scope',    opts?.scope);
    setIf('priority', opts?.priority);
    setIf('isRead',   opts?.isRead);

    //console.log('user params =>', params.toString());
    return this.http.get<NotificationListResponse>(`${this.apiUrl}/user`, { params });
  }

  getNotificationById(id: number | string): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`);
  }

  markSingleAsRead(notificationId: number): Observable<number> {
    return this.http
      .post<Notification>(`${this.apiUrl}/mark-single-as-read`, { notificationId })
      .pipe(
        switchMap(() => this.loadUnreadCount())
      );
  }

  loadUnreadCount() {
    return this.http
      .get<{ count: number }>(`${this.apiUrl}/unread-count`)
      .pipe(
        tap(res => this.unreadCountSubject.next(res?.count ?? 0)),
        map(res => res.count ?? 0)
      );
  }

}