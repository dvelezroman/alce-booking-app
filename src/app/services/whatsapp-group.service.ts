import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetGroupsResponse, GetWhatsAppContactsResponse, WhatsAppStatus } from './dtos/whatsapp-group.dto';
import { GetDiffusionGroupsResponse } from './dtos/whatsapp-diffusion-group.dto';
import { SendContactMessageDto, SendContactMessageResponse, SendDiffusionMessageDto, SendDiffusionMessageResponse, SendGroupMessageDto, SendGroupMessageResponse } from './dtos/whatsapp-send.dto';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppGroupService {
  private apiUrl = `${environment.whatsappApiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  sendMessageToContact( payload: SendContactMessageDto ): Observable<SendContactMessageResponse> {
    return this.http.post<SendContactMessageResponse>( `${this.apiUrl}/send`, payload );
  }

  sendMessageToGroup( payload: SendGroupMessageDto ): Observable<SendGroupMessageResponse> {
    return this.http.post<SendGroupMessageResponse>( `${this.apiUrl}/send-group`, payload );
  }

  sendMessageToDiffusion( payload: SendDiffusionMessageDto ): Observable<SendDiffusionMessageResponse> {
    return this.http.post<SendDiffusionMessageResponse>(`${this.apiUrl}/send-diffusion`, payload );
  }

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