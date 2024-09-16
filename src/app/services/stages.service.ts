import {Store} from "@ngrx/store";
import {CreateStageDto, Stage, UpdateStageDto} from "./dtos/student.dto";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class StagesService {
  private apiUrl = `${environment.apiUrl}/stages`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getById(id: number): Observable<Stage> {
    return this.http.get<Stage>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.apiUrl}`)
  }

  create(data: CreateStageDto): Observable<Stage> {
    return this.http.post<Stage>(`${this.apiUrl}`, data);
  }

  update(id: number, data: UpdateStageDto): Observable<Stage> {
    return this.http.patch<Stage>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
