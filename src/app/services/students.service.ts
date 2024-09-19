import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {Mode, RegisterStudentDto, RegisterStudentResponseDto, Student} from "./dtos/student.dto";
import {setUserData} from "../store/user.action";
import {UserDto} from "./dtos/user.dto";
import {selectUserData} from "../store/user.selector";

@Injectable({
  providedIn: 'root',
})
export class StudentsService implements OnInit{
  private apiUrl = `${environment.apiUrl}/students`;
  private userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.userData$.subscribe(state => {
      console.log(state);
      this.userData = state;
    });
  }

  registerStudent(user: RegisterStudentDto): Observable<RegisterStudentResponseDto> {
    return this.http.post<RegisterStudentResponseDto>(`${this.apiUrl}/register`, user).pipe(
      tap(response => {
        this.store.dispatch(setUserData({ data: { ...this.userData, student: {...response} } as UserDto }));
      })
    );
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
