import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import {
  createTrigger,
  createTriggerFailure,
  createTriggerSuccess,
  deleteTrigger,
  deleteTriggerFailure,
  deleteTriggerSuccess,
  linkAction,
  linkActionFailure,
  linkActionSuccess,
  loadTriggers,
  loadTriggersFailure,
  loadTriggersSuccess,
  selectTrigger,
  unlinkAction,
  unlinkActionFailure,
  unlinkActionSuccess,
  updateTrigger,
  updateTriggerFailure,
  updateTriggerSuccess,
} from '../actions/triggers.actions';
import { TriggersState } from '../models/trigger.model';

const TRIGGERS_FEATURE_KEY = 'triggers';

export const initialTriggersState: TriggersState = {
  triggers: [],
  isLoading: false,
  error: null,
  selectedTrigger: null,
};

export const triggersReducer = createReducer(
  initialTriggersState,
  on(loadTriggers, createTrigger, updateTrigger, deleteTrigger, linkAction, unlinkAction, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(loadTriggersSuccess, (state, { triggers }) => ({ ...state, triggers, isLoading: false })),
  on(createTriggerSuccess, (state, { trigger }) => ({
    ...state,
    triggers: [...state.triggers, trigger],
    isLoading: false,
  })),
  on(updateTriggerSuccess, (state, { trigger }) => ({
    ...state,
    triggers: state.triggers.map((t) => (t.id === trigger.id ? trigger : t)),
    isLoading: false,
    selectedTrigger: null,
  })),
  on(deleteTriggerSuccess, (state, { id }) => ({
    ...state,
    triggers: state.triggers.filter((t) => t.id !== id),
    isLoading: false,
  })),
  on(linkActionSuccess, unlinkActionSuccess, (state) => ({ ...state, isLoading: false })),
  on(
    loadTriggersFailure,
    createTriggerFailure,
    updateTriggerFailure,
    deleteTriggerFailure,
    linkActionFailure,
    unlinkActionFailure,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })
  ),
  on(selectTrigger, (state, { trigger }) => ({ ...state, selectedTrigger: trigger }))
);

export const selectTriggersState = createFeatureSelector<TriggersState>(TRIGGERS_FEATURE_KEY);
export const selectAllTriggers = createSelector(selectTriggersState, (s) => s.triggers);
export const selectTriggersIsLoading = createSelector(selectTriggersState, (s) => s.isLoading);
export const selectTriggersError = createSelector(selectTriggersState, (s) => s.error);
export const selectSelectedTrigger = createSelector(selectTriggersState, (s) => s.selectedTrigger);
