import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AssessementI, CreateAssessmentI, FilterAssessmentI, UpdateAssessmentI} from "./dtos/assessment.dto";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private apiUrl = `${environment.apiUrl}/assessments`;

  constructor(
    private http: HttpClient,
  ) {}

  create(createData: CreateAssessmentI): Observable<AssessementI> {
    return this.http.post<AssessementI>(`${this.apiUrl}/assessments`, createData);
  }

  delete(id: number): Observable<AssessementI> {
    return this.http.delete<AssessementI>(`${this.apiUrl}/assessments/${id}`);
  }

  update(id: number, data: UpdateAssessmentI): Observable<AssessementI> {
    return this.http.patch<AssessementI>(`${this.apiUrl}/assessments/${id}`, data);
  }

  find(id: number): Observable<AssessementI> {
    return this.http.get<AssessementI>(`${this.apiUrl}/${id}`);
  }

  findAll(query: FilterAssessmentI): Observable<AssessementI[]> {
    const { stageId, studentId, instructorId, type} = query;
    let params = new HttpParams();

    if (!!stageId) {
      params = params.set('stageId', stageId.toString());
    }

    if (!!studentId) {
      params = params.set('unit', studentId.toString());
    }

    if (!!instructorId) {
      params = params.set('instructorId', instructorId.toString());
    }

    if (!!type) {
      params = params.set('type', type);
    }
    return this.http.get<AssessementI[]>(`${this.apiUrl}/assessments`, { params });
  }
}
