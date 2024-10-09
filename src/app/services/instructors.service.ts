import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject, takeUntil, tap, withLatestFrom} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {Mode, Student} from "./dtos/student.dto";
import {setUserData} from "../store/user.action";
import {UserDto} from "./dtos/user.dto";
import {selectUserData} from "../store/user.selector";
import {Instructor, RegisterInstructorDto, RegisterInstructorResponseDto} from "./dtos/instructor.dto";

@Injectable({
  providedIn: 'root',
})
export class InstructorsService implements OnInit{
  private apiUrl = `${environment.apiUrl}/instructors`;
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

  registerInstructor(user: RegisterInstructorDto): Observable<[RegisterInstructorResponseDto, UserDto | null]> {
    return this.http.post<RegisterInstructorResponseDto>(this.apiUrl, user).pipe(
      withLatestFrom(this.userData$), // Wait for latest user data
      tap(([response, userData]) => {
        this.store.dispatch(setUserData({
          data: {
            ...userData,
            instructor: { ...response }
          } as UserDto
        }));
      })
    );
  }

  getAll(): Observable<Instructor[]> {
    return this.http.get<Instructor[]>(this.apiUrl);
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
