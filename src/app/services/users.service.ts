import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {setAdminStatus, setLoggedInStatus, setUserData, unsetUserData} from "../store/user.action";
import {LoginDto, LoginResponseDto, RegisterResponseDto, UserDto, UserRole} from "./dtos/user.dto";
import {Router} from "@angular/router";
import {selectUserData} from "../store/user.selector";

@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnInit{
  private apiUrl = `${environment.apiUrl}/users`;
  private userData$: Observable<UserDto | null>;
  userData: UserDto | null = null;

  constructor(
    private http: HttpClient,
    private store: Store,
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
      this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
      this.store.dispatch(setAdminStatus({ isAdmin: false }));
      this.store.dispatch(unsetUserData());
    }
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
