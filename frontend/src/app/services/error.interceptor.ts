import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          authService.logout();
          router.navigate(['/login']);
          break;
        case 429:
          console.error('Too many requests — rate limit reached:', req.url);
          break;
        case 500:
        case 502:
        case 503:
          console.error('Server error:', err.status, req.url);
          break;
      }
      return throwError(() => err);
    })
  );
};
