// email.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  SendEmailRequest,
  SendBulkEmailRequest,
  SendTemplateEmailRequest,
  EmailResponse,
  BulkEmailResponse,
  GetEmailMessagesQuery,
  GetEmailMessagesResponse,
  EmailMessage,
} from '../services/dtos/email.dto';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private apiUrl = `${environment.apiUrl}/email`;

  constructor(private http: HttpClient) {}

  // --- Envío de emails ---
  sendEmail(payload: SendEmailRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, payload);
  }

  sendBulkEmail(payload: SendBulkEmailRequest): Observable<BulkEmailResponse> {
    return this.http.post<BulkEmailResponse>(`${this.apiUrl}/send-bulk`, payload);
  }

  sendTemplateEmail(payload: SendTemplateEmailRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.apiUrl}/send-template`, payload);
  }

  // --- Consulta de mensajes ---
  getEmailMessages(filters: GetEmailMessagesQuery): Observable<GetEmailMessagesResponse> {
    let params = new HttpParams();

    if (filters.page != null) params = params.set('page', String(filters.page));
    if (filters.limit != null) params = params.set('limit', String(filters.limit));
    if (filters.recipientType) params = params.set('recipientType', filters.recipientType);
    if (filters.recipientEmail) params = params.set('recipientEmail', filters.recipientEmail);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.createdAtFrom) params = params.set('createdAtFrom', filters.createdAtFrom);
    if (filters.createdAtTo) params = params.set('createdAtTo', filters.createdAtTo);
    if (filters.sentAtFrom) params = params.set('sentAtFrom', filters.sentAtFrom);
    if (filters.sentAtTo) params = params.set('sentAtTo', filters.sentAtTo);

    return this.http.get<GetEmailMessagesResponse>(`${this.apiUrl}/messages`, { params });
  }

  getEmailMessageById(id: number | string): Observable<EmailMessage> {
    return this.http.get<EmailMessage>(`${this.apiUrl}/messages/${id}`);
  }

  // --- Validación ---
  validateEmailAddress(email: string): Observable<{ valid: boolean; reason?: string }> {
    return this.http.post<{ valid: boolean; reason?: string }>(`${this.apiUrl}/validate`, { email });
  }

  // --- Información del servicio ---
  getEmailStatus(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/status`);
  }

  getEmailInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/info`);
  }

  getEmailHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }

  getEmailStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }
}