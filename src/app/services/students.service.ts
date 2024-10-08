import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
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

  registerStudent(user: RegisterStudentDto): Observable<RegisterStudentResponseDto> {
    return this.http.post<RegisterStudentResponseDto>(`${this.apiUrl}/register`, user);
  }

  // Find student by ID
  findStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/find/${id}`);
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
      params: params
    });
  }
}
