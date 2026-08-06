import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlatformAssessmentAssignment } from './dtos/platform-assessment.dto';

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
}
