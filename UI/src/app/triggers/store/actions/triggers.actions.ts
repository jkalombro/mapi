import { createAction, props } from '@ngrx/store';
import { Trigger, TriggerRequest, UpdateTriggerRequest } from '../models/trigger.model';

export const loadTriggers = createAction('[Triggers] Load Triggers');
export const loadTriggersSuccess = createAction('[Triggers] Load Triggers Success', props<{ triggers: Trigger[] }>());
export const loadTriggersFailure = createAction('[Triggers] Load Triggers Failure', props<{ error: string }>());

export const createTrigger = createAction('[Triggers] Create Trigger', props<{ request: TriggerRequest }>());
export const createTriggerSuccess = createAction('[Triggers] Create Trigger Success', props<{ trigger: Trigger }>());
export const createTriggerFailure = createAction('[Triggers] Create Trigger Failure', props<{ error: string }>());

export const updateTrigger = createAction('[Triggers] Update Trigger', props<{ id: string; request: UpdateTriggerRequest }>());
export const updateTriggerSuccess = createAction('[Triggers] Update Trigger Success', props<{ trigger: Trigger }>());
export const updateTriggerFailure = createAction('[Triggers] Update Trigger Failure', props<{ error: string }>());

export const deleteTrigger = createAction('[Triggers] Delete Trigger', props<{ id: string }>());
export const deleteTriggerSuccess = createAction('[Triggers] Delete Trigger Success', props<{ id: string }>());
export const deleteTriggerFailure = createAction('[Triggers] Delete Trigger Failure', props<{ error: string }>());

export const selectTrigger = createAction('[Triggers] Select Trigger', props<{ trigger: Trigger | null }>());
