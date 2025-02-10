import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {DisabledDays} from "./dtos/handle-date.dto";

@Injectable({
  providedIn: 'root',
})
export class HandleDatesService {
  private apiUrl = `${environment.apiUrl}/handle-dates`;

  constructor(
    private http: HttpClient,
  ) {}

  getNotAvailableDates(from: string, to: string): Observable<DisabledDays> {
    let params = new HttpParams();

    if (from) {
      params = params.set('from', from);
    }

    if (to) {
      params = params.set('to', to);
    }
    return this.http.get<DisabledDays>(`${this.apiUrl}`, { params });
  }

  disableDates(dates: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/disable`, { dates });
  }

  enableDates(dates: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/enable`,  { dates });
  }
}
