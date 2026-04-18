import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';
import { AuthEffects } from './effects/auth.effects';
import { AuthApiService } from './api/auth.service';
import { login, loginFailure, loginSuccess, logout, register, registerFailure, registerSuccess } from './actions/auth.actions';
import { authReducer, initialAuthState, AUTH_TOKEN_KEY, selectToken, selectIsAuthenticated, selectAuthIsLoading, selectAuthError } from './reducers/auth.reducer';
import { AuthResponse } from './models/auth.model';

const CLEAN_STATE = { user: null, token: null, isLoading: false, error: null };

// ── Reducer Tests ─────────────────────────────────────────────────────────────

describe('authReducer', () => {
  beforeEach(() => localStorage.clear());

  it('should return initial state for unknown action', () => {
    const state = authReducer(undefined, { type: '@@UNKNOWN' } as Action);
    expect(state).toEqual(initialAuthState);
  });

  it('should set isLoading=true on login action', () => {
    const state = authReducer(initialAuthState, login({ request: { email: 'a@b.com', password: 'pw' } }));
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should store token and clear error on loginSuccess', () => {
    const response: AuthResponse = { accessToken: 'tok', tokenType: 'Bearer' };
    const state = authReducer(initialAuthState, loginSuccess({ response }));
    expect(state.token).toBe('tok');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should store error and clear loading on loginFailure', () => {
    const state = authReducer(initialAuthState, loginFailure({ error: 'Invalid credentials' }));
    expect(state.error).toBe('Invalid credentials');
    expect(state.isLoading).toBe(false);
    expect(state.token).toBeNull();
  });

  it('should reset to unauthenticated state on logout', () => {
    const authenticatedState = { ...initialAuthState, token: 'some-token', user: { email: 'a@b.com' } };
    const state = authReducer(authenticatedState, logout());
    expect(state).toEqual(CLEAN_STATE);
  });
});

// ── Selector Tests ────────────────────────────────────────────────────────────

describe('auth selectors', () => {
  it('selectToken should return the token', () => {
    const state = { auth: { ...initialAuthState, token: 'my-token' } };
    expect(selectToken(state)).toBe('my-token');
  });

  it('selectIsAuthenticated should be true when token exists', () => {
    const state = { auth: { ...initialAuthState, token: 'tok' } };
    expect(selectIsAuthenticated(state)).toBe(true);
  });

  it('selectIsAuthenticated should be false when no token', () => {
    const state = { auth: { ...initialAuthState, token: null } };
    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it('selectAuthIsLoading should return loading state', () => {
    const state = { auth: { ...initialAuthState, isLoading: true } };
    expect(selectAuthIsLoading(state)).toBe(true);
  });

  it('selectAuthError should return error', () => {
    const state = { auth: { ...initialAuthState, error: 'Oops' } };
    expect(selectAuthError(state)).toBe('Oops');
  });
});

// ── Effects Tests ─────────────────────────────────────────────────────────────

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let authServiceMock: jest.Mocked<AuthApiService>;
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    localStorage.clear();
    authServiceMock = { login: jest.fn(), register: jest.fn() } as unknown as jest.Mocked<AuthApiService>;
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: AuthApiService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    effects = TestBed.inject(AuthEffects);
  });

  it('should dispatch loginSuccess on successful login', (done) => {
    const response: AuthResponse = { accessToken: 'token', tokenType: 'Bearer' };
    authServiceMock.login.mockReturnValue(of(response));

    actions$ = of(login({ request: { email: 'a@b.com', password: 'pw' } }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(loginSuccess({ response }));
      done();
    });
  });

  it('should dispatch loginFailure on login error', (done) => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Invalid credentials')));

    actions$ = of(login({ request: { email: 'a@b.com', password: 'wrong' } }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(loginFailure({ error: 'Invalid credentials' }));
      done();
    });
  });

  it('should dispatch registerSuccess on successful registration', (done) => {
    const response: AuthResponse = { accessToken: 'new-token', tokenType: 'Bearer' };
    authServiceMock.register.mockReturnValue(of(response));

    actions$ = of(register({ request: { email: 'new@b.com', password: 'pw', storeName: 'Store' } }));

    effects.register$.subscribe((action) => {
      expect(action).toEqual(registerSuccess({ response }));
      done();
    });
  });

  it('should dispatch registerFailure on registration error', (done) => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('Email taken')));

    actions$ = of(register({ request: { email: 'a@b.com', password: 'pw', storeName: 'Store' } }));

    effects.register$.subscribe((action) => {
      expect(action).toEqual(registerFailure({ error: 'Email taken' }));
      done();
    });
  });

  it('should navigate to /items and persist token on loginSuccess', (done) => {
    actions$ = of(loginSuccess({ response: { accessToken: 'tok', tokenType: 'Bearer' } }));

    effects.loginSuccess$.subscribe(() => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/items']);
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('tok');
      done();
    });
  });

  it('should navigate to /items and persist token on registerSuccess', (done) => {
    actions$ = of(registerSuccess({ response: { accessToken: 'reg-tok', tokenType: 'Bearer' } }));

    effects.loginSuccess$.subscribe(() => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/items']);
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('reg-tok');
      done();
    });
  });

  it('should navigate to /auth/login and clear token on logout', (done) => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'existing-token');
    actions$ = of(logout());

    effects.logout$.subscribe(() => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
      done();
    });
  });

  it('should dispatch loginFailure with fallback message for non-Error', (done) => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ code: 500 })));

    actions$ = of(login({ request: { email: 'a@b.com', password: 'pw' } }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(loginFailure({ error: 'An unexpected error occurred. Please try again.' }));
      done();
    });
  });
});
