import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LeadSchedulingRequestService {
  private readonly instructorBase = `${environment.apiUrl}/instructor/lead-scheduling-requests`;
  private readonly adminBase = `${environment.apiUrl}/lead-scheduling-requests`;

  constructor(private readonly http: HttpClient) {}

  listMine(query?: LeadSchedulingListQuery): Observable<LeadSchedulingListResponse> {
    let params = new HttpParams();
    if (query?.kind) params = params.set('kind', query.kind);
    if (query?.status) params = params.set('status', query.status);
    if (query?.createdFrom) params = params.set('createdFrom', query.createdFrom);
    if (query?.createdTo) params = params.set('createdTo', query.createdTo);
    if (query?.limit != null) params = params.set('limit', String(query.limit));
    if (query?.offset != null) params = params.set('offset', String(query.offset));
    return this.http.get<LeadSchedulingListResponse>(this.instructorBase, {
      params,
    });
  }

  getMine(id: number): Observable<LeadSchedulingRequestRow> {
    return this.http.get<LeadSchedulingRequestRow>(
      `${this.instructorBase}/${id}`,
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
    let params = new HttpParams();
    if (query?.kind) params = params.set('kind', query.kind);
    if (query?.status) params = params.set('status', query.status);
    if (query?.createdFrom) params = params.set('createdFrom', query.createdFrom);
    if (query?.createdTo) params = params.set('createdTo', query.createdTo);
    if (query?.limit != null) params = params.set('limit', String(query.limit));
    if (query?.offset != null) params = params.set('offset', String(query.offset));
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
}
