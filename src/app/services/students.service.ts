import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {Mode, RegisterStudentDto, RegisterStudentResponseDto, Student} from "./dtos/student.dto";

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  registerStudent(user: RegisterStudentDto): Observable<RegisterStudentResponseDto> {
    return this.http.post<RegisterStudentResponseDto>(`${this.apiUrl}/register`, user, { headers: this.getHeaders() });
  }

  // Find student by ID
  findStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/find/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Find students by stageId or mode
  findStudentsByStageOrMode(stageId?: number, mode?: Mode): Observable<Student[]> {
    let params = new HttpParams();
    if (stageId) {
      params = params.set('stageId', stageId.toString());
    }
    if (mode) {
      params = params.set('mode', mode);
    }

    return this.http.get<Student[]>(`${this.apiUrl}/search`, {
      headers: this.getHeaders(),
      params: params
    });
  }
}
