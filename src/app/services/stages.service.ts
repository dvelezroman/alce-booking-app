import {Store} from "@ngrx/store";
import {Stage} from "./dtos/student.dto";
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

  getAll(): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.apiUrl}`)
  }
}
