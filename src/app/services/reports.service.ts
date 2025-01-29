import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {MeetingThemeDto} from "./dtos/meeting-theme.dto";

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getDetailedStatistics(studentId: number, from: string, to: string, stageId?: number): Observable<MeetingThemeDto> {
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

    return this.http.get<MeetingThemeDto>(`${this.apiUrl}/detail`, { params });
  }

  update(id: number,  data: MeetingThemeDto): Observable<MeetingThemeDto> {
    return this.http.patch<MeetingThemeDto>(`${this.apiUrl}/${id}`, data);
  }
}
