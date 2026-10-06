import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { CourtesyDemoMonthlyReportResponse } from './dtos/courtesy-demo-monthly-report.dto';
import {
  LeadSchedulingListResponse,
  LeadSchedulingRequestRow,
  SubmitLeadSchedulingInstructorReportDto,
  UpdateLeadSchedulingAdminDto,
} from './dtos/lead-scheduling-request.dto';

export interface LeadSchedulingListQuery {
  kind?: string;
  status?: string;
  createdFrom?: string;
  createdTo?: string;
  scheduledFrom?: string;
  scheduledTo?: string;
  sortBy?: 'createdAt' | 'scheduledSession';
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

function appendLeadSchedulingListParams(
  params: HttpParams,
  query?: LeadSchedulingListQuery,
): HttpParams {
  let p = params;
  if (query?.kind) p = p.set('kind', query.kind);
  if (query?.status) p = p.set('status', query.status);
  if (query?.createdFrom) p = p.set('createdFrom', query.createdFrom);
  if (query?.createdTo) p = p.set('createdTo', query.createdTo);
  if (query?.scheduledFrom) p = p.set('scheduledFrom', query.scheduledFrom);
  if (query?.scheduledTo) p = p.set('scheduledTo', query.scheduledTo);
  if (query?.sortBy) p = p.set('sortBy', query.sortBy);
  if (query?.sortDir) p = p.set('sortDir', query.sortDir);
  if (query?.limit != null) p = p.set('limit', String(query.limit));
  if (query?.offset != null) p = p.set('offset', String(query.offset));
  return p;
}

@Injectable({
  providedIn: 'root',
})
export class LeadSchedulingRequestService {
  private readonly instructorBase = `${environment.apiUrl}/instructor/lead-scheduling-requests`;
  private readonly adminBase = `${environment.apiUrl}/lead-scheduling-requests`;
  private readonly assignedInductionsBase = `${environment.apiUrl}/admin/assigned-inductions`;

  constructor(private readonly http: HttpClient) {}

  listMine(query?: LeadSchedulingListQuery): Observable<LeadSchedulingListResponse> {
    const params = appendLeadSchedulingListParams(new HttpParams(), query);
    return this.http.get<LeadSchedulingListResponse>(this.instructorBase, {
      params,
    });
  }

  getMine(id: number): Observable<LeadSchedulingRequestRow> {
    return this.http.get<LeadSchedulingRequestRow>(
      `${this.instructorBase}/${id}`,
    );
  }

  listAssignedInductions(
    query?: LeadSchedulingListQuery,
  ): Observable<LeadSchedulingListResponse> {
    const params = appendLeadSchedulingListParams(new HttpParams(), query);
    return this.http.get<LeadSchedulingListResponse>(
      this.assignedInductionsBase,
      { params },
    );
  }

  getAssignedInduction(id: number): Observable<LeadSchedulingRequestRow> {
    return this.http.get<LeadSchedulingRequestRow>(
      `${this.assignedInductionsBase}/${id}`,
    );
  }

  submitAdminInductionReport(
    id: number,
    body: SubmitLeadSchedulingInstructorReportDto,
  ): Observable<LeadSchedulingRequestRow> {
    return this.http.patch<LeadSchedulingRequestRow>(
      `${environment.apiUrl}/lead-scheduling-requests/${id}/admin-induction-report`,
      body,
    );
  }

  submitInstructorReport(
    id: number,
    body: SubmitLeadSchedulingInstructorReportDto,
  ): Observable<LeadSchedulingRequestRow> {
    return this.http.patch<LeadSchedulingRequestRow>(
      `${environment.apiUrl}/lead-scheduling-requests/${id}/instructor-report`,
      body,
    );
  }

  listAdmin(query?: LeadSchedulingListQuery): Observable<LeadSchedulingListResponse> {
    const params = appendLeadSchedulingListParams(new HttpParams(), query);
    return this.http.get<LeadSchedulingListResponse>(this.adminBase, { params });
  }

  getAdmin(id: number): Observable<LeadSchedulingRequestRow> {
    return this.http.get<LeadSchedulingRequestRow>(`${this.adminBase}/${id}`);
  }

  patchAdmin(
    id: number,
    body: UpdateLeadSchedulingAdminDto,
  ): Observable<LeadSchedulingRequestRow> {
    return this.http.patch<LeadSchedulingRequestRow>(
      `${this.adminBase}/${id}`,
      body,
    );
  }

  getCourtesyMonthlyReport(query: {
    year: number;
    month: number;
    instructorId?: number;
    advisorOfficeLabel?: string;
  }): Observable<CourtesyDemoMonthlyReportResponse> {
    let params = new HttpParams()
      .set('year', String(query.year))
      .set('month', String(query.month));
    if (query.instructorId != null) {
      params = params.set('instructorId', String(query.instructorId));
    }
    if (query.advisorOfficeLabel?.trim()) {
      params = params.set(
        'advisorOfficeLabel',
        query.advisorOfficeLabel.trim(),
      );
    }
    return this.http.get<CourtesyDemoMonthlyReportResponse>(
      `${this.adminBase}/reports/courtesy-monthly`,
      { params },
    );
  }
}
