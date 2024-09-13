import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const HttpInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const router = inject(Router);
  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  // Pass the cloned request with the updated header to the next handler
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to the login page if the status code is 401 (Unauthorized)
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
