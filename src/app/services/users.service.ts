import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {setAdminStatus, setLoggedInStatus, setUserData, unsetUserData} from "../store/user.action";
import {LoginDto, LoginResponseDto, RegisterResponseDto, UserDto, UserRole} from "./dtos/user.dto";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  register(user: Partial<UserDto>): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.apiUrl}/register`, user);
  }

  completeRegister(user: Partial<UserDto>): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.apiUrl}/complete-register`, user);
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
