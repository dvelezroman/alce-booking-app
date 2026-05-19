import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateWhatsappContentTemplateDto,
  UpdateWhatsappContentTemplateDto,
  WhatsappContentTemplate,
} from './dtos/whatsapp-content-template.dto';

@Injectable({
  providedIn: 'root',
})
export class WhatsappContentTemplateService {
  private readonly base = `${environment.apiUrl}/notificador/whatsapp/content-templates`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<WhatsappContentTemplate[]> {
    return this.http.get<WhatsappContentTemplate[]>(this.base);
  }

  create(body: CreateWhatsappContentTemplateDto): Observable<WhatsappContentTemplate> {
    return this.http.post<WhatsappContentTemplate>(this.base, body);
  }

  update(
    id: number,
    body: UpdateWhatsappContentTemplateDto,
  ): Observable<WhatsappContentTemplate> {
    return this.http.patch<WhatsappContentTemplate>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
