import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InstructorEvaluation, CreateInstructorEvaluationDto, PendingMeetingEvaluation } from './dtos/instructor-evaluation.dto';

@Injectable({
  providedIn: 'root'
})
export class InstructorEvaluationService {

  private apiUrl = `${environment.apiUrl}/meetings`;

  constructor(private http: HttpClient) {}

  // ----------------------------------------
  // CREATE evaluation for a meeting
  // ----------------------------------------
  create(meetingId: number, payload: CreateInstructorEvaluationDto ): Observable<InstructorEvaluation> {
     return this.http.post<InstructorEvaluation>(`${this.apiUrl}/${meetingId}/evaluation`, payload );
  }

  // ----------------------------------------
  // GET evaluation by meetingId
  // ----------------------------------------
  getByMeeting(meetingId: number): Observable<InstructorEvaluation> {
    return this.http.get<InstructorEvaluation>(`${this.apiUrl}/${meetingId}/evaluation`);
  }

  // ----------------------------------------
  // GET evaluations made by current student
  // ----------------------------------------
  getMyEvaluations(limit: number = 50, offset: number = 0 ): Observable<InstructorEvaluation[]> {

    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<InstructorEvaluation[]>(
      `${this.apiUrl}/evaluations/my-evaluations`,
      { params }
    );
  }

  // ----------------------------------------
  // GET pending meetings to be evaluated
  // ----------------------------------------
  getPendingEvaluations(limit: number = 50, offset: number = 0): Observable<PendingMeetingEvaluation[]> {

    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<PendingMeetingEvaluation[]>(
      `${this.apiUrl}/evaluations/pending`,
      { params }
    );
  }
}