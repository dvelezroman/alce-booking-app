import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetWhatsAppGroupsResponse,  GroupContactsRequestDto,  GroupContactsResponseDto } from './dtos/whatsapp-group.dto';
import {  DiffusionContactsRequestDto,  DiffusionContactsResponseDto,  GetDiffusionGroupsResponse } from './dtos/whatsapp-diffusion-group.dto';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppGroupService {
  private apiUrl = `${environment.whatsappApiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  checkApiHealth(): Observable<any> {
  return this.http.get(`${environment. whatsappApiUrl}/health`);
}

  checkApiWelcome(): Observable<any> {
    return this.http.get(`${environment. whatsappApiUrl}/`);
  }

  getGroups(): Observable<GetWhatsAppGroupsResponse> {
    return this.http.get<GetWhatsAppGroupsResponse>(`${this.apiUrl}/groups`);
  }

  getDiffusionGroups(): Observable<GetDiffusionGroupsResponse> {
    return this.http.get<GetDiffusionGroupsResponse>(`${this.apiUrl}/diffusion-groups`);
  }

  getGroupContacts( payload: GroupContactsRequestDto ): Observable<GroupContactsResponseDto> {
    return this.http.post<GroupContactsResponseDto>(`${this.apiUrl}/group-contacts`,payload);
  }

  getDiffusionContacts( payload: DiffusionContactsRequestDto ): Observable<DiffusionContactsResponseDto> {
    return this.http.post<DiffusionContactsResponseDto>(`${this.apiUrl}/diffusion-contacts`,payload);
  }
}