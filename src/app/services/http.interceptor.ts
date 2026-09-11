import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {Injector, inject} from "@angular/core";
import { Router } from '@angular/router';
import {catchError, finalize, switchMap, throwError, shareReplay, Observable} from 'rxjs';
import {SpinnerService} from "./spinner.service";
import {
  SKIP_SPINNER,
  shouldSkipSpinnerForUrl,
} from '../shared/http/skip-spinner.context';
import { UsersService } from './users.service';
import { LoginResponseDto } from './dtos/user.dto';

/** In-flight refresh shared across concurrent 401s (single-flight). */
let refreshInFlight$: Observable<LoginResponseDto> | null = null;

function isAuthEndpoint(url: string): boolean {
  if (url.includes('/users/logout')) {
    return true;
  }
  // POST /users/login (not GET /users/refresh/login)
  if (url.includes('/users/login') && !url.includes('/refresh/login')) {
    return true;
  }
  // POST /users/refresh only — not GET /users/refresh/login
  if (url.includes('/users/refresh') && !url.includes('/users/refresh/login')) {
    return true;
  }
  return false;
}

export const HttpInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const router = inject(Router);
  const spinner = inject(SpinnerService);
  // Lazy resolve avoids circular DI: UsersService -> HttpClient -> this interceptor
  const injector = inject(Injector);
  const skipSpinner =
    req.context.get(SKIP_SPINNER) || shouldSkipSpinnerForUrl(req.url);

  if (!skipSpinner) {
    spinner.show();
  }

  const isFormData = req.body instanceof FormData;
  const skipAuthAttach = req.url.includes('/users/refresh') && !req.url.includes('/users/refresh/login');

  const authReq = skipAuthAttach
    ? req.clone({
        setHeaders: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
      })
    : req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' })
        }
      });

  return next(authReq).pipe(
    finalize(() => {
      if (!skipSpinner) {
        spinner.hide();
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const usersService = injector.get(UsersService);

      // Do not attempt refresh for auth endpoints themselves
      if (isAuthEndpoint(req.url)) {
        if (!req.url.includes('/users/logout')) {
          router.navigate(['/login']);
        }
        return throwError(() => error);
      }

      // Already retried once — give up
      if (req.headers.has('X-Retry-After-Refresh')) {
        usersService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

      if (!refreshToken) {
        usersService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      if (!refreshInFlight$) {
        refreshInFlight$ = usersService.refreshWithToken().pipe(
          shareReplay({ bufferSize: 1, refCount: false }),
          finalize(() => {
            refreshInFlight$ = null;
          })
        );
      }

      return refreshInFlight$.pipe(
        switchMap(() => {
          const newAccessToken =
            typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
              'X-Retry-After-Refresh': '1',
              ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            },
          });
          return next(retryReq);
        }),
        catchError((refreshError) => {
          usersService.logout();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
