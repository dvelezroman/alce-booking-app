import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  StageAssessmentResource,
  CreateStageAssessmentResourceDto,
  UpdateStageAssessmentResourceDto
} from './dtos/stage-resources.dto';

@Injectable({
  providedIn: 'root',
})
export class StageAssessmentResourcesService {
  private apiUrl = `${environment.apiUrl}/stage-assessment-resource`;

  constructor(private http: HttpClient) {}

  /** Obtener 1 por ID */
  getById(id: number): Observable<StageAssessmentResource> {
    return this.http.get<StageAssessmentResource>(`${this.apiUrl}/${id}`);
  }

  getAll(filters?: { stageId?: number; active?: boolean }): Observable<StageAssessmentResource[]> {
    let params = new HttpParams();

    if (filters?.stageId !== undefined) {
      params = params.set('stageId', filters.stageId);
    }

    if (filters?.active !== undefined) {
      params = params.set('active', filters.active);
    }

    return this.http.get<StageAssessmentResource[]>(`${this.apiUrl}`, { params });
  }

  /** Crear */
  create(data: CreateStageAssessmentResourceDto): Observable<StageAssessmentResource> {
    return this.http.post<StageAssessmentResource>(`${this.apiUrl}`, data);
  }

  /** Actualizar */
  update(id: number, data: UpdateStageAssessmentResourceDto): Observable<StageAssessmentResource> {
    return this.http.patch<StageAssessmentResource>(`${this.apiUrl}/${id}`, data);
  }

  /** Eliminar */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}