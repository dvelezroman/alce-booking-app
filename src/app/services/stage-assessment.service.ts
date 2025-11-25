import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  CreateStageAssessmentDto,
  StageAssessmentFilters,
  StageAssessment
} from './dtos/stage-assessment.dto';

@Injectable({
  providedIn: 'root',
})
export class StageAssessmentService {
  private apiUrl = `${environment.apiUrl}/stage-assessment`;

  constructor(private http: HttpClient) {}

  /** Crear stage assessment */
  create(data: CreateStageAssessmentDto): Observable<StageAssessment> {
    return this.http.post<StageAssessment>(`${this.apiUrl}`, data);
  }

  /** Obtener todos con filtros opcionales */
  getAll(filters?: StageAssessmentFilters): Observable<StageAssessment[]> {
    let params = new HttpParams();

    if (filters?.stageId !== undefined) {
      params = params.set('stageId', filters.stageId);
    }

    if (filters?.createdBy !== undefined) {
      params = params.set('createdBy', filters.createdBy);
    }

    if (filters?.stageAssessmentResourceId !== undefined) {
      params = params.set(
        'stageAssessmentResourceId',
        filters.stageAssessmentResourceId
      );
    }

    return this.http.get<StageAssessment[]>(`${this.apiUrl}`, { params });
  }

  /** Obtener por ID */
  getById(id: number): Observable<StageAssessment> {
    return this.http.get<StageAssessment>(`${this.apiUrl}/${id}`);
  }

  /** Actualizar assessment por ID */
  update(id: number, data: Partial<CreateStageAssessmentDto>): Observable<StageAssessment> {
    return this.http.patch<StageAssessment>(`${this.apiUrl}/${id}`, data);
  }

  /** Eliminar assessment */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Marcar assessment como terminado para un estudiante */
  markFinished(id: number): Observable<StageAssessment> {
    return this.http.post<StageAssessment>(`${this.apiUrl}/${id}/mark-finished`, {});
  }

  /** Verificar si un estudiante tiene assessments activos */
  checkActiveByStudent(studentId: number): Observable<{ active: boolean }> {
    return this.http.get<{ active: boolean }>(
      `${this.apiUrl}/student/${studentId}/active`
    );
  }
}