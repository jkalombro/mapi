import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { logout } from '../../store/actions/auth.actions';

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === HTTP_UNAUTHORIZED) {
          store.dispatch(logout());
          router.navigate(['/auth/login']);
        }

        if (error.status === HTTP_FORBIDDEN) {
          router.navigate(['/auth/login']);
        }
      }

      return throwError(() => error);
    })
  );
}
