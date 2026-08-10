import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApplyWritingScoreResult,
  PlatformAssessmentAssignment,
  RemotePlatformAssessmentFilters,
  RemotePlatformAssessmentListResponse,
} from './dtos/platform-assessment.dto';

@Injectable({
  providedIn: 'root',
})
export class PlatformAssessmentService {
  private apiUrl = `${environment.apiUrl}/platform-assessments`;

  constructor(private http: HttpClient) {}

  getAll(studentId: number): Observable<PlatformAssessmentAssignment[]> {
    const params = new HttpParams().set('studentId', studentId);
    return this.http.get<PlatformAssessmentAssignment[]>(this.apiUrl, {
      params,
    });
  }

  /**
   * Admin: live list from Assessments via alce-api S2S proxy.
   * Browser never talks to Assessments directly.
   */
  getRemote(
    filters: RemotePlatformAssessmentFilters = {},
  ): Observable<RemotePlatformAssessmentListResponse> {
    let params = new HttpParams();
    const entries: Array<[string, string | number | undefined | null]> = [
      ['page', filters.page],
      ['limit', filters.limit],
      ['studentId', filters.studentId],
      ['externalStudentId', filters.externalStudentId],
      ['status', filters.status],
      ['templateId', filters.templateId],
      ['templateTitle', filters.templateTitle],
      ['studentStage', filters.studentStage],
      ['outcome', filters.outcome],
      ['assignedFrom', filters.assignedFrom],
      ['assignedTo', filters.assignedTo],
      ['completedFrom', filters.completedFrom],
      ['completedTo', filters.completedTo],
    ];

    for (const [key, value] of entries) {
      if (value === undefined || value === null || value === '') continue;
      params = params.set(key, String(value));
    }

    return this.http.get<RemotePlatformAssessmentListResponse>(
      `${this.apiUrl}/remote`,
      { params },
    );
  }

  /** Admin: create/overwrite Writing score from S2S platform result points. */
  applyWritingScore(
    platformAssignmentId: number,
    points?: number,
  ): Observable<ApplyWritingScoreResult> {
    const body =
      points !== undefined && points !== null ? { points } : {};
    return this.http.post<ApplyWritingScoreResult>(
      `${this.apiUrl}/${platformAssignmentId}/apply-writing-score`,
      body,
    );
  }
}
