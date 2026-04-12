import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
  createActionFailure,
  createActionSuccess,
  createNewAction,
  deleteAction,
  deleteActionFailure,
  deleteActionSuccess,
  loadActions,
  loadActionsFailure,
  loadActionsSuccess,
  selectAction,
  updateAction,
  updateActionFailure,
  updateActionSuccess,
} from '../actions/actions.actions';
import { ActionsState } from '../models/action.model';

const ACTIONS_FEATURE_KEY = 'actions';

export const initialActionsState: ActionsState = {
  actions: [],
  isLoading: false,
  error: null,
  selectedAction: null,
};

export const actionsReducer = createReducer(
  initialActionsState,
  on(loadActions, createNewAction, updateAction, deleteAction, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(loadActionsSuccess, (state, { actions }) => ({
    ...state,
    actions,
    isLoading: false,
  })),
  on(createActionSuccess, (state, { action }) => ({
    ...state,
    actions: [...state.actions, action],
    isLoading: false,
  })),
  on(updateActionSuccess, (state, { action }) => ({
    ...state,
    actions: state.actions.map((a) => (a.id === action.id ? action : a)),
    isLoading: false,
    selectedAction: null,
  })),
  on(deleteActionSuccess, (state, { id }) => ({
    ...state,
    actions: state.actions.filter((a) => a.id !== id),
    isLoading: false,
  })),
  on(loadActionsFailure, createActionFailure, updateActionFailure, deleteActionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(selectAction, (state, { action }) => ({
    ...state,
    selectedAction: action,
  }))
);

export const selectActionsState = createFeatureSelector<ActionsState>(ACTIONS_FEATURE_KEY);
export const selectAllActions = createSelector(selectActionsState, (s) => s.actions);
export const selectActionsIsLoading = createSelector(selectActionsState, (s) => s.isLoading);
export const selectActionsError = createSelector(selectActionsState, (s) => s.error);
export const selectSelectedAction = createSelector(selectActionsState, (s) => s.selectedAction);
