import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EarlyWarningListParams,
  EarlyWarningListResponseDto,
  EarlyWarningSummaryDto,
} from './dtos/early-warnings.dto';

@Injectable({
  providedIn: 'root',
})
export class EarlyWarningsService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<EarlyWarningSummaryDto> {
    return this.http.get<EarlyWarningSummaryDto>(
      `${this.apiUrl}/early-warnings/summary`,
    );
  }

  list(
    params: EarlyWarningListParams = {},
  ): Observable<EarlyWarningListResponseDto> {
    let httpParams = new HttpParams();
    if (params.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }
    if (params.alertType) {
      httpParams = httpParams.set('alertType', params.alertType);
    }
    if (params.stageId != null) {
      httpParams = httpParams.set('stageId', String(params.stageId));
    }
    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    return this.http.get<EarlyWarningListResponseDto>(
      `${this.apiUrl}/early-warnings`,
      { params: httpParams },
    );
  }
}
