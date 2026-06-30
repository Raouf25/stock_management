import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          authService.logout();
          router.navigate(['/login']);
          break;
        case 403:
          router.navigate(['/error/403']);
          break;
        case 404:
          toastService.error('Ressource introuvable.');
          break;
        case 429:
          toastService.warning('Trop de requêtes — veuillez patienter.');
          break;
        case 500:
        case 502:
        case 503:
          router.navigate(['/error/500']);
          break;
      }
      return throwError(() => err);
    })
  );
};
