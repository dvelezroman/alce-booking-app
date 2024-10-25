import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";
import {FeatureFlagDto} from "./dtos/feature-flag.dto";

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  private apiUrl = `${environment.apiUrl}/feature-flags`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getAll(): Observable<FeatureFlagDto[]> {
    return this.http.get<FeatureFlagDto[]>(`${this.apiUrl}`);
  }

  create(data: FeatureFlagDto): Observable<FeatureFlagDto> {
    return this.http.post<FeatureFlagDto>(`${this.apiUrl}`, data);
  }

  toggle(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}`, {});
  }
}
