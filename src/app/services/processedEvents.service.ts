import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProcessedEventDto, ProcessedEventFilterDto } from './dtos/process-event-filter.dto';

@Injectable({
  providedIn: 'root'
})
export class ProcessedEventsService {
  private apiUrl = `${environment.apiUrl}/processed-events`;

  constructor(private http: HttpClient) {}

  getProcessedEvents(filters: ProcessedEventFilterDto): Observable<ProcessedEventDto[]> {
    let params = new HttpParams();

    if (filters.eventType) {
      params = params.set('eventType', filters.eventType);
    }

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    if (filters.processedById) {
      params = params.set('processedById', filters.processedById.toString());
    }

    if (filters.search) {
     params = params.set('search', filters.search);
    }
    return this.http.get<ProcessedEventDto[]>(this.apiUrl, { params });
  }
}
