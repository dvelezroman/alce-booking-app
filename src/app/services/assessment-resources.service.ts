import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {
  AssessmentResourceI,
  CreateAssessmentResourceI,
  UpdateAssessmentResourceI
} from "./dtos/assessment-resources.dto";

@Injectable({
  providedIn: 'root',
})
export class AssessmentResourcesService {
  private apiUrl = `${environment.apiUrl}/assessment-resources`;

  constructor(
    private http: HttpClient,
  ) {}

  getById(id: number): Observable<AssessmentResourceI> {
    return this.http.get<AssessmentResourceI>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<AssessmentResourceI[]> {
    return this.http.get<AssessmentResourceI[]>(`${this.apiUrl}`)
  }

  create(data: CreateAssessmentResourceI): Observable<AssessmentResourceI> {
    return this.http.post<AssessmentResourceI>(`${this.apiUrl}`, data);
  }

  update(id: number,  data: UpdateAssessmentResourceI): Observable<AssessmentResourceI> {
    return this.http.put<AssessmentResourceI>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAssessmentResourcesByStudentId(studentId: number): Observable<AssessmentResourceI[]> {
    return this.http.get<AssessmentResourceI[]>(`${this.apiUrl}/student/${studentId}`);
  }
}
