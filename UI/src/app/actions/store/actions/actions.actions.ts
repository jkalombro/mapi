import { createAction, props } from '@ngrx/store';
import { Action } from '../models/action.model';

export const loadActions = createAction('[Actions] Load Actions');
export const loadActionsSuccess = createAction('[Actions] Load Actions Success', props<{ actions: Action[] }>());
export const loadActionsFailure = createAction('[Actions] Load Actions Failure', props<{ error: string }>());
