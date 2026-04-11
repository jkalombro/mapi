import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthApiService } from '../api/auth.service';
import { login, loginFailure, loginSuccess, logout, register, registerFailure, registerSuccess } from '../actions/auth.actions';

const ITEMS_ROUTE = '/items';
const LOGIN_ROUTE = '/auth/login';

@Injectable()
export class AuthEffects {
  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ request }) =>
        this.authService.login(request).pipe(
          map((response) => loginSuccess({ response })),
          catchError((error: unknown) =>
            of(loginFailure({ error: this.extractError(error) }))
          )
        )
      )
    )
  );

  readonly register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),
      switchMap(({ request }) =>
        this.authService.register(request).pipe(
          map((response) => registerSuccess({ response })),
          catchError((error: unknown) =>
            of(registerFailure({ error: this.extractError(error) }))
          )
        )
      )
    )
  );

  readonly loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, registerSuccess),
        tap(() => this.router.navigate([ITEMS_ROUTE]))
      ),
    { dispatch: false }
  );

  readonly logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => this.router.navigate([LOGIN_ROUTE]))
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthApiService,
    private readonly router: Router
  ) {}

  private extractError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
