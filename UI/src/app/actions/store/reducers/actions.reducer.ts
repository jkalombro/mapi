import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { loadActions, loadActionsFailure, loadActionsSuccess } from '../actions/actions.actions';
import { ActionsState } from '../models/action.model';

const ACTIONS_FEATURE_KEY = 'actions';

export const initialActionsState: ActionsState = {
  actions: [],
  isLoading: false,
  error: null,
};

export const actionsReducer = createReducer(
  initialActionsState,
  on(loadActions, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadActionsSuccess, (state, { actions }) => ({ ...state, actions, isLoading: false })),
  on(loadActionsFailure, (state, { error }) => ({ ...state, isLoading: false, error }))
);

export const selectActionsState = createFeatureSelector<ActionsState>(ACTIONS_FEATURE_KEY);
export const selectAllActions = createSelector(selectActionsState, (s) => s.actions);
export const selectActionsIsLoading = createSelector(selectActionsState, (s) => s.isLoading);
export const selectActionsError = createSelector(selectActionsState, (s) => s.error);
