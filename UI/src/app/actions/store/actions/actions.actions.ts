import { createAction, props } from '@ngrx/store';
import { Action, CreateActionRequest, UpdateActionRequest } from '../models/action.model';

export const loadActions = createAction('[Actions] Load Actions');
export const loadActionsSuccess = createAction('[Actions] Load Actions Success', props<{ actions: Action[] }>());
export const loadActionsFailure = createAction('[Actions] Load Actions Failure', props<{ error: string }>());

export const createNewAction = createAction('[Actions] Create New Action', props<{ request: CreateActionRequest }>());
export const createActionSuccess = createAction('[Actions] Create Action Success', props<{ action: Action }>());
export const createActionFailure = createAction('[Actions] Create Action Failure', props<{ error: string }>());

export const updateAction = createAction('[Actions] Update Action', props<{ id: string; request: UpdateActionRequest }>());
export const updateActionSuccess = createAction('[Actions] Update Action Success', props<{ action: Action }>());
export const updateActionFailure = createAction('[Actions] Update Action Failure', props<{ error: string }>());

export const deleteAction = createAction('[Actions] Delete Action', props<{ id: string }>());
export const deleteActionSuccess = createAction('[Actions] Delete Action Success', props<{ id: string }>());
export const deleteActionFailure = createAction('[Actions] Delete Action Failure', props<{ error: string }>());

export const selectAction = createAction('[Actions] Select Action', props<{ action: Action | null }>());
