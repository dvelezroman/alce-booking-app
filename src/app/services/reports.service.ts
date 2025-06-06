import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {MeetingDataI, MeetingReportDetailed, StatisticalDataI} from "./dtos/meeting-theme.dto";
import {UserRole, UsersResponse, UserStatus} from "./dtos/user.dto";

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

  getStatisticsByStudentId(studentId: number, from: string, to: string, stageId?: number): Observable<StatisticalDataI> {
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

    return this.http.get<StatisticalDataI>(`${this.apiUrl}/statistics/${studentId}`, { params });
  }

  getMeetingsByStudentId(studentId: number, from: string, to: string, stageId?: number): Observable<MeetingDataI[]> {
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

    return this.http.get<MeetingDataI[]>(`${this.apiUrl}/statistics/${studentId}/meetings`, { params });
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

    return this.http.get(`${this.apiUrl}/statistics/${studentId}/csv`, { params, responseType: 'blob' });
  }

  getCsvSummaryReport(from: string, to: string, stageId?: number) {
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

    return this.http.get(`${this.apiUrl}/statistics/total/summary/csv`, { params, responseType: 'blob' });
  }

  getCsvDailySummaryReport(from: string, to: string, studentId?: number, stageId?: number) {
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

    return this.http.get(`${this.apiUrl}/statistics/daily/summary/csv`, { params, responseType: 'blob' });
  }

  getInstructorAssistanceGroupedByReport(instructorId: number, from: string, to: string) {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    return this.http.get(`${this.apiUrl}/instructor/${instructorId}/hours`, { params })
  }

  getInstructorsMeetingsGroupedByHour(from: string, to: string) {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    return this.http.get(`${this.apiUrl}/instructors/hours`, { params })
  }

  getUsersData(
    page: number,
    userId?: number,
    userRole?: UserRole,
    userStatus?: UserStatus,
    stageId?: number,
    comment?: boolean,
    alert?: boolean,
    newStudents?: boolean
  ) {
    let params = new HttpParams()

    .set('page', page.toString());

    if (userId) params = params.set('userId', userId.toString());
    if (userRole) params = params.set('userRole', userRole);
    if (userStatus) params = params.set('userStatus', userStatus);
    if (stageId) params = params.set('stageId', stageId.toString());
    if (comment) params = params.set('comment', comment.toString());
    if (alert) params = params.set('alert', alert.toString());
    if (newStudents) params = params.set('newStudents', newStudents.toString());

    return this.http.get<UsersResponse>(`${this.apiUrl}/users/data`, { params });
  }
}
