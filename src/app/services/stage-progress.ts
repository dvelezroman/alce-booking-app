import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  StageProgressList,
  StageProgressSingle,
  StageProgressByStage,
  StageProgressRecalculateResponse
} from './dtos/stage-progress.dto';

@Injectable({
  providedIn: 'root',
})
export class StageProgressService{
  
  private apiUrl = `${environment.apiUrl}/stage-progress`;

  constructor(
    private http: HttpClient,
  ) {}

  /**
   * Obtener progreso TOTAL de un estudiante (los 19 stages)
   */
  getProgressByStudent(studentId: number): Observable<StageProgressList> {
    return this.http.get<StageProgressList>(`${this.apiUrl}/student/${studentId}`);
  }

  /**
   * Obtener progreso del estudiante en un stage específico
   */
  getProgressByStudentByStage(
    studentId: number,
    stageId: number
  ): Observable<StageProgressSingle> {
    return this.http.get<StageProgressSingle>(
      `${this.apiUrl}/student/${studentId}/stage/${stageId}`
    );
  }

  /**
   *  Obtener progreso de TODOS LOS ESTUDIANTES para un stage
   */
  getProgressForStage(stageId: number): Observable<StageProgressByStage> {
    return this.http.get<StageProgressByStage>(`${this.apiUrl}/stage/${stageId}`);
  }

  /**
   *  Recalcular manualmente el progreso de un Stage (async)
   */
  recalculateProgressForStage(
    stageId: number
  ): Observable<StageProgressRecalculateResponse> {
    return this.http.post<StageProgressRecalculateResponse>(
      `${this.apiUrl}/recalculate/stage/${stageId}`,
      {} // body vacío
    );
  }
}