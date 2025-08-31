import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateNotificationGroupDto, FilterNotificationGroupDto, NotificationGroupDto } from './dtos/notification.dto';

@Injectable({
  providedIn: 'root',
})
export class NotificationGroupService {
  private apiUrl = `${environment.apiUrl}/notification-groups`;

  constructor(private http: HttpClient) {}

  // Crear un grupo
  createGroup(
    groupData: CreateNotificationGroupDto
  ): Observable<NotificationGroupDto> {
    return this.http.post<NotificationGroupDto>(this.apiUrl, groupData);
  }

  // Obtener todos los grupos
    getGroups(filters?: FilterNotificationGroupDto): Observable<NotificationGroupDto[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.description) params = params.set('description', filters.description);
      if (filters.userId !== undefined) params = params.set('userId', filters.userId.toString());
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<NotificationGroupDto[]>(this.apiUrl, { params });
  }

}