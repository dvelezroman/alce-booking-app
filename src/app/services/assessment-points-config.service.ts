import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AssessmentConfigI} from "./dtos/assessment.dto";

@Injectable({
  providedIn: 'root',
})
export class AssessmentPointsConfigService {
  private apiUrl = `${environment.apiUrl}/assessment-config`;

  constructor(
    private http: HttpClient,
  ) {}

  getById(id: number = 1): Observable<AssessmentConfigI> {
    return this.http.get<AssessmentConfigI>(`${this.apiUrl}/${id}`);
  }

  update(id: number, max: number, min: number, daysNewStudent: number, minHoursScheduled: number): Observable<AssessmentConfigI> {
    return this.http.patch<AssessmentConfigI>(`${this.apiUrl}/${id}`, { 
      maxPointsAssessment: max, 
      minPointsAssessment: min, 
      numberDaysNewStudent: daysNewStudent,
      minHoursScheduled: minHoursScheduled
    });
  }
}
