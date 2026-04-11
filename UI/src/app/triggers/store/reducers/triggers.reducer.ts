import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { createTrigger, createTriggerFailure, createTriggerSuccess, deleteTrigger, deleteTriggerFailure, deleteTriggerSuccess, linkAction, linkActionFailure, linkActionSuccess, loadTriggers, loadTriggersFailure, loadTriggersSuccess, unlinkAction, unlinkActionFailure, unlinkActionSuccess } from '../actions/triggers.actions';
import { TriggersState } from '../models/trigger.model';

const TRIGGERS_FEATURE_KEY = 'triggers';

export const initialTriggersState: TriggersState = {
  triggers: [],
  isLoading: false,
  error: null,
};

export const triggersReducer = createReducer(
  initialTriggersState,
  on(loadTriggers, createTrigger, deleteTrigger, linkAction, unlinkAction, (state) => ({ ...state, isLoading: true, error: null })),
  on(loadTriggersSuccess, (state, { triggers }) => ({ ...state, triggers, isLoading: false })),
  on(createTriggerSuccess, (state, { trigger }) => ({ ...state, triggers: [...state.triggers, trigger], isLoading: false })),
  on(deleteTriggerSuccess, (state, { id }) => ({ ...state, triggers: state.triggers.filter((t) => t.id !== id), isLoading: false })),
  on(linkActionSuccess, unlinkActionSuccess, (state) => ({ ...state, isLoading: false })),
  on(loadTriggersFailure, createTriggerFailure, deleteTriggerFailure, linkActionFailure, unlinkActionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }))
);

export const selectTriggersState = createFeatureSelector<TriggersState>(TRIGGERS_FEATURE_KEY);
export const selectAllTriggers = createSelector(selectTriggersState, (s) => s.triggers);
export const selectTriggersIsLoading = createSelector(selectTriggersState, (s) => s.isLoading);
