import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject, take, takeUntil, tap, withLatestFrom} from 'rxjs';
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
  private unsubscribe$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.userData$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      console.log(state);
      this.userData = state;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  registerStudent(user: RegisterStudentDto): Observable<[RegisterStudentResponseDto, UserDto | null]> {
    return this.http.post<RegisterStudentResponseDto>(`${this.apiUrl}/register`, user).pipe(
      withLatestFrom(this.userData$), // Wait for latest user data
      tap(([response, userData]) => {
        this.store.dispatch(setUserData({
          data: {
            ...userData,
            student: { ...response }
          } as UserDto
        }));
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

  updateStudentById(id: number, data: Partial<Student>): Observable<Student> {
  return this.http.patch<Student>(`${this.apiUrl}/${id}`, data).pipe(
    tap((updatedStudent) => {
      // ✅ Actualizar snapshot en localStorage (sin duplicar token)
      if (typeof window !== 'undefined' && localStorage) {
        const raw = localStorage.getItem('userData');
        const current: UserDto | null = raw ? JSON.parse(raw) : null;

        if (current) {
          const merged: UserDto = {
            ...current, // mantiene el accessToken y demás datos
            student: { ...(current.student || {}), ...updatedStudent },
          };

          localStorage.setItem('userData', JSON.stringify(merged));
        }
      }
    })
  );
}
}

