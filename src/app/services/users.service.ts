import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {environment} from "../../environments/environment";
import {Store} from "@ngrx/store";
import {setAdminStatus, setLoggedInStatus} from "../store/user.action";
import {LoginDto, LoginResponseDto, RegisterResponseDto, UserDto, UserRole} from "./dtos/user.dto";

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  register(user: Partial<UserDto>): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.apiUrl}/register`, user, { headers: this.getHeaders() });
  }

  completeRegister(user: UserDto): Observable<RegisterResponseDto> {
    return this.http.post<RegisterResponseDto>(`${this.apiUrl}/complete-register`, user, { headers: this.getHeaders() });
  }

  login(credentials: LoginDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            this.isLoggedInSubject.next(!!response.accessToken);
            this.isAdmin$.next(response.role === UserRole.ADMIN);
            this.store.dispatch(setAdminStatus({ isAdmin: response.role === UserRole.ADMIN }));
            this.store.dispatch(setLoggedInStatus({ isLoggedIn: !!response.accessToken }));
          }
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
      this.isLoggedInSubject.next(false);
      this.isAdmin$.next(false);
      this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
      this.store.dispatch(setAdminStatus({ isAdmin: false }));
    }
  }

  update(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

}
