import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Observable,
  TimeoutError,
  catchError,
  switchMap,
  takeWhile,
  throwError,
  timer,
  timeout,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { skipSpinnerContext } from '../shared/http/skip-spinner.context';
import {
  EnqueueWhatsappResponse,
  SendWhatsappRequest,
  ValidatePhonesResponse,
  WhatsappGateStatusResponse,
  WhatsappJobStatusResponse,
} from './dtos/whatsapp-notificador.dto';

export interface PollJobOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WhatsAppNotificadorService {
  private readonly base = `${environment.apiUrl}/notificador/whatsapp`;

  constructor(private readonly http: HttpClient) {}

  validatePhones(phones: string[]): Observable<ValidatePhonesResponse> {
    return this.http.post<ValidatePhonesResponse>(`${this.base}/validate`, {
      phones,
    });
  }

  send(body: SendWhatsappRequest): Observable<EnqueueWhatsappResponse> {
    return this.http.post<EnqueueWhatsappResponse>(`${this.base}/send`, body);
  }

  getJob(jobId: string): Observable<WhatsappJobStatusResponse> {
    return this.http.get<WhatsappJobStatusResponse>(
      `${this.base}/jobs/${jobId}`,
      skipSpinnerContext(),
    );
  }

  getStatus(batchId?: string): Observable<WhatsappGateStatusResponse> {
    let params = new HttpParams();
    if (batchId) {
      params = params.set('batchId', batchId);
    }
    return this.http.get<WhatsappGateStatusResponse>(`${this.base}/status`, {
      params,
      ...skipSpinnerContext(),
    });
  }

  pollJobUntilComplete(
    jobId: string,
    options?: PollJobOptions,
  ): Observable<WhatsappJobStatusResponse> {
    const intervalMs = options?.intervalMs ?? 3000;
    const timeoutMs = options?.timeoutMs ?? 600_000;

    return timer(0, intervalMs).pipe(
      switchMap(() => this.getJob(jobId)),
      takeWhile((job) => !job.completed, true),
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new Error(
                'El envío está tardando más de lo esperado. Puedes reintentar la consulta más tarde.',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
