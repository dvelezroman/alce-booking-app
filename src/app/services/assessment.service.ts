import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AssessementI, AutomaticPromotionsReport, CreateAssessmentI, EligiblePromotionPreview, FilterAssessmentI, PromoteEligibleResult, PromotionCronStatus, UpdateAssessmentI} from "./dtos/assessment.dto";
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
    return this.http.post<AssessementI>(`${this.apiUrl}`, createData);
  }

  delete(id: number): Observable<AssessementI> {
    return this.http.delete<AssessementI>(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: UpdateAssessmentI): Observable<AssessementI> {
    return this.http.patch<AssessementI>(`${this.apiUrl}/${id}`, data);
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
      params = params.set('studentId', studentId.toString());
    }

    if (!!instructorId) {
      params = params.set('instructorId', instructorId.toString());
    }

    if (!!type) {
      params = params.set('type', type);
    }
    return this.http.get<AssessementI[]>(`${this.apiUrl}`, { params });
  }

  remove(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPromotionCron(): Observable<PromotionCronStatus> {
    return this.http.get<PromotionCronStatus>(`${this.apiUrl}/promotion-cron`);
  }

  setPromotionCron(enabled: boolean): Observable<PromotionCronStatus> {
    return this.http.patch<PromotionCronStatus>(`${this.apiUrl}/promotion-cron`, {
      enabled,
    });
  }

  listAutomaticPromotions(query: {
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<AutomaticPromotionsReport> {
    let params = new HttpParams();
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.page != null) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit != null) {
      params = params.set('limit', query.limit.toString());
    }
    return this.http.get<AutomaticPromotionsReport>(
      `${this.apiUrl}/automatic-promotions`,
      { params },
    );
  }

  previewPromoteEligible(): Observable<EligiblePromotionPreview[]> {
    return this.http.get<EligiblePromotionPreview[]>(
      `${this.apiUrl}/promote-eligible/preview`,
    );
  }

  promoteEligible(studentIds: number[]): Observable<PromoteEligibleResult> {
    return this.http.post<PromoteEligibleResult>(
      `${this.apiUrl}/promote-eligible`,
      { studentIds },
    );
  }
}
