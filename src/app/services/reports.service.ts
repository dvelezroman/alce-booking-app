import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {Meeting, MeetingReportDetailed} from "./dtos/meeting-theme.dto";

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getDetailedStatistics(studentId: number, from: string, to: string, stageId?: number): Observable<MeetingReportDetailed[]> {
    let params = new HttpParams();

    if (studentId) {
      params = params.set('studentId', studentId.toString());
    }
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    if (stageId) {
      params = params.set('stageId', stageId.toString());
    }

    return this.http.get<MeetingReportDetailed[]>(`${this.apiUrl}/detail`, { params });
  }

  getStatisticsByStudentId(studentId: number, from: string, to: string, stageId?: number): Observable<{ report: any }> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    if (stageId) {
      params = params.set('stageId', stageId.toString());
    }

    return this.http.get<{ report: any }>(`${this.apiUrl}/statistics/${studentId}`, { params });
  }

  getMeetingsByStudentId(studentId: number, from: string, to: string, stageId?: number): Observable<{ meetings: Meeting[] }> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    if (stageId) {
      params = params.set('stageId', stageId.toString());
    }

    return this.http.get<{ meetings: Meeting[] }>(`${this.apiUrl}/statistics/${studentId}/meetings`, { params });
  }

  getCsvReport(type: string, studentId: number, from: string, to: string, stageId?: number) {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    if (stageId) {
      params = params.set('stageId', stageId.toString());
    }

    return this.http.get(`${this.apiUrl}/statistics/${studentId}/meetings`, { params, responseType: 'blob' });
  }
}
