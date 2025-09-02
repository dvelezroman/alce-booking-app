import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Instructor } from './dtos/instructor.dto';
import { Stage } from './dtos/student.dto';

export interface InstructorStageLink {
  id?: number;
  instructorId: number;
  stageId: number;
  instructor?: Instructor;
  stage?: Stage;
}

@Injectable({ providedIn: 'root' })
export class InstructorStageService {
  private apiUrl = `${environment.apiUrl}/instructor-stage`;

  constructor(private http: HttpClient) {}

  list(params?: { instructorId?: number; stageId?: number }): Observable<InstructorStageLink[]> {
    let httpParams = new HttpParams();
    if (params?.instructorId != null) httpParams = httpParams.set('instructorId', String(params.instructorId));
    if (params?.stageId != null)      httpParams = httpParams.set('stageId', String(params.stageId));
    return this.http.get<InstructorStageLink[]>(this.apiUrl, { params: httpParams });
  }

  getByIds(instructorId: number, stageId: number): Observable<InstructorStageLink> {
    return this.http.get<InstructorStageLink>(`${this.apiUrl}/${instructorId}/${stageId}`);
  }
}