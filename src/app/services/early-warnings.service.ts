import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EarlyWarningFilterOptionsDto,
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

  private buildParams(params: EarlyWarningListParams = {}): HttpParams {
    let httpParams = new HttpParams();
    const setIf = (key: string, value: string | number | null | undefined) => {
      if (value === null || value === undefined || value === '') return;
      httpParams = httpParams.set(key, String(value));
    };

    setIf('page', params.page);
    setIf('limit', params.limit);
    setIf('alertType', params.alertType);
    setIf('stageId', params.stageId);
    setIf('search', params.search?.trim());
    setIf('classification', params.classification);
    setIf('mode', params.mode);
    setIf('city', params.city?.trim());
    setIf('minDaysInStage', params.minDaysInStage);
    setIf('maxDaysInStage', params.maxDaysInStage);
    setIf('minMeetingsInWindow', params.minMeetingsInWindow);
    setIf('maxMeetingsInWindow', params.maxMeetingsInWindow);
    return httpParams;
  }

  getSummary(
    params: EarlyWarningListParams = {},
  ): Observable<EarlyWarningSummaryDto> {
    return this.http.get<EarlyWarningSummaryDto>(
      `${this.apiUrl}/early-warnings/summary`,
      { params: this.buildParams(params) },
    );
  }

  getFilterOptions(): Observable<EarlyWarningFilterOptionsDto> {
    return this.http.get<EarlyWarningFilterOptionsDto>(
      `${this.apiUrl}/early-warnings/filter-options`,
    );
  }

  list(
    params: EarlyWarningListParams = {},
  ): Observable<EarlyWarningListResponseDto> {
    return this.http.get<EarlyWarningListResponseDto>(
      `${this.apiUrl}/early-warnings`,
      { params: this.buildParams(params) },
    );
  }

  downloadExcel(params: EarlyWarningListParams = {}): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/early-warnings/excel`, {
      params: this.buildParams(params),
      responseType: 'blob',
    });
  }
}
