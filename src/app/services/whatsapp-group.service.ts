import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetGroupsResponse, GetWhatsAppContactsResponse, WhatsAppStatus } from './dtos/whatsapp-group.dto';
import { GetDiffusionGroupsResponse } from './dtos/whatsapp-diffusion-group.dto';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppGroupService {
  private apiUrl = `${environment.whatsappApiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  getGroups(): Observable<GetGroupsResponse> {
    return this.http.get<GetGroupsResponse>(`${this.apiUrl}/groups`);
  }

  getDiffusionGroups(): Observable<GetDiffusionGroupsResponse> {
    return this.http.get<GetDiffusionGroupsResponse>(`${this.apiUrl}/broadcasts`);
  }

  getContacts(): Observable<GetWhatsAppContactsResponse> {
    return this.http.get<GetWhatsAppContactsResponse>(`${this.apiUrl}/contacts`);
  }

  getGroupsFromDatabase(): Observable<GetGroupsResponse> {
    return this.http.get<GetGroupsResponse>(`${this.apiUrl}/groups/database`);
  }

  getDiffusionGroupsFromDatabase(): Observable<GetDiffusionGroupsResponse> {
    return this.http.get<GetDiffusionGroupsResponse>(`${this.apiUrl}/broadcasts/database`);
  }

  getStatus(): Observable<WhatsAppStatus> {
    return this.http.get<WhatsAppStatus>(`${this.apiUrl}/status`);
  }

  

}