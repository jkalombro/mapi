import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { login, loginFailure, loginSuccess, logout, register, registerFailure, registerSuccess } from '../actions/auth.actions';
import { AuthState } from '../models/auth.model';

const AUTH_FEATURE_KEY = 'auth';

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(login, register, (state) => ({ ...state, isLoading: true, error: null })),
  on(loginSuccess, registerSuccess, (state, { response }) => ({
    ...state,
    token: response.accessToken,
    user: { email: '' },
    isLoading: false,
    error: null,
  })),
  on(loginFailure, registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(logout, () => initialAuthState)
);

export const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectToken = createSelector(selectAuthState, (state) => state.token);
export const selectIsAuthenticated = createSelector(selectAuthState, (state) => state.token !== null);
export const selectAuthIsLoading = createSelector(selectAuthState, (state) => state.isLoading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);
