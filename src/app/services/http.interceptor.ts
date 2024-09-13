import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import { Router } from '@angular/router';
import {catchError, finalize, throwError} from 'rxjs';
import {SpinnerService} from "./spinner.service";

export const HttpInterceptor: HttpInterceptorFn = (req, next) => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const router = inject(Router);
  const spinner = inject(SpinnerService);
  // Show spinner before the request starts
  spinner.show();

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });
  // Pass the cloned request with the updated header to the next handler
  return next(authReq).pipe(
    finalize(() => spinner.hide()),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to the login page if the status code is 401 (Unauthorized)
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
