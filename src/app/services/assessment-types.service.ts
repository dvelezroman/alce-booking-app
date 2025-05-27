import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {AssessmentTypeI, CreateAssessmentTypeI, UpdateAssessmentTypeI} from "./dtos/assessment-type.dto";

@Injectable({
  providedIn: 'root',
})
export class AssessmentTypesService {
  private apiUrl = `${environment.apiUrl}/assessment-types`;

  constructor(
    private http: HttpClient,
  ) {}

  getById(id: number): Observable<AssessmentTypeI> {
    return this.http.get<AssessmentTypeI>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<AssessmentTypeI[]> {
    return this.http.get<AssessmentTypeI[]>(`${this.apiUrl}`)
  }

  create(data: CreateAssessmentTypeI): Observable<AssessmentTypeI> {
    return this.http.post<AssessmentTypeI>(`${this.apiUrl}`, data);
  }

  update(id: number,  data: UpdateAssessmentTypeI): Observable<AssessmentTypeI> {
    return this.http.put<AssessmentTypeI>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
