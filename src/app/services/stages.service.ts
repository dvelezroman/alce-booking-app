import {Store} from "@ngrx/store";
import {Stage} from "./dtos/student.dto";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
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
  ) {
  }

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Stage[]> {
    return this.http.get<Stage[]>(`${this.apiUrl}`, {headers: this.getHeaders()})
  }
}
