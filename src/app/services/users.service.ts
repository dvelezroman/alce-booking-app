import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, Subject, tap} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {setAdminStatus, setInstructorLink, setLoggedInStatus, setUserData, unsetUserData} from "../store/user.action";
import {LoginDto, LoginResponseDto, RegisterResponseDto, UserDto, UserRole} from "./dtos/user.dto";
import {Router} from "@angular/router";
import {selectUserData} from "../store/user.selector";
import { LinksService } from './links.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnInit{
  private apiUrl = `${environment.apiUrl}/users`;
  private userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private store: Store,
    private linksService: LinksService,
    private router: Router,
  ) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.userData$.subscribe(state => {
      console.log(state);
      this.userData = state;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  create(user: Partial<UserDto>) {
    return this.http.post<RegisterResponseDto>(this.apiUrl, user);
  }

  register(user: Partial<UserDto>): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.apiUrl}/register`, user);
  }

  completeRegister(user: Partial<UserDto>): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.apiUrl}/complete-register`, user).pipe(
      tap(response => {
        this.store.dispatch(setAdminStatus({ isAdmin: response.user.role === UserRole.ADMIN }));
        this.store.dispatch(setUserData({ data: { ...this.userData, ...response.user } }));
      })
    );
  }

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
          }
          this.store.dispatch(setAdminStatus({ isAdmin: response.role === UserRole.ADMIN }));
          this.store.dispatch(setLoggedInStatus({ isLoggedIn: !!response.accessToken }));
          this.store.dispatch(setUserData({ data: response }));
          
          if (response.role === UserRole.INSTRUCTOR && response.instructor?.meetingLink?.link) {
            const link = response.instructor.meetingLink.link;
            localStorage.setItem('instructorLink', link);
            this.store.dispatch(setInstructorLink({ link }));
          }
          if (response.accessToken) {
            this.router.navigate(['register-complete']);
          }
        })
      );
  }

  refreshLogin(): Observable<LoginResponseDto> {
    return this.http.get<LoginResponseDto>(`${this.apiUrl}/refresh/login`)
      .pipe(
        tap((response) => {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
          }
          this.store.dispatch(setAdminStatus({ isAdmin: response.role === UserRole.ADMIN }));
          this.store.dispatch(setLoggedInStatus({ isLoggedIn: !!response.accessToken }));
          this.store.dispatch(setUserData({ data: response }));
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('instructorLink');
      this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
      this.store.dispatch(setAdminStatus({ isAdmin: false }));
      this.store.dispatch(unsetUserData());
      this.store.dispatch(setInstructorLink({ link: null }));
    }
  }

  update(id: number, user: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchUsers(
    page?: number,
    limit?: number,
    email?: string,
    firstName?: string,
    lastName?: string,
    status?: string,
    role?: string,
    register?: boolean,
    stageId?: number,
  ): Observable<{ users: UserDto[], total: number }> {
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page);
    }
    if (limit) {
      params = params.set('limit', limit);
    }

    if (email) {
      params = params.set('email', email);
    }
    if (firstName) {
      params = params.set('firstName', firstName);
    }
    if (lastName) {
      params = params.set('lastName', lastName);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (role) {
      params = params.set('role', role);
    }
    if (register) {
      params = params.set('register', register.toString());
    }
    if (stageId) {
      params = params.set('stageId', stageId.toString());
    }

    return this.http.get<{ users: UserDto[], total: number }>(`${this.apiUrl}/search`, { params });
  }
}
