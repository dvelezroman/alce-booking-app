import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {MeetingThemeDto} from "./dtos/meeting-theme.dto";

@Injectable({
  providedIn: 'root',
})
export class MeetingThemesService {
  private apiUrl = `${environment.apiUrl}/meeting-themes`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getById(id: number): Observable<MeetingThemeDto> {
    return this.http.get<MeetingThemeDto>(`${this.apiUrl}/${id}`);
  }

  create(data: MeetingThemeDto): Observable<MeetingThemeDto> {
    return this.http.post<MeetingThemeDto>(`${this.apiUrl}`, data);
  }

  update(id: number,  data: MeetingThemeDto): Observable<MeetingThemeDto> {
    return this.http.patch<MeetingThemeDto>(`${this.apiUrl}/${id}`, data);
  }
}
