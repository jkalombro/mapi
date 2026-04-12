import { createAction, props } from '@ngrx/store';
import { ActionLinkRequest, Trigger, TriggerRequest, UpdateTriggerRequest } from '../models/trigger.model';

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

export const linkAction = createAction('[Triggers] Link Action', props<{ triggerId: string; request: ActionLinkRequest }>());
export const linkActionSuccess = createAction('[Triggers] Link Action Success');
export const linkActionFailure = createAction('[Triggers] Link Action Failure', props<{ error: string }>());

export const unlinkAction = createAction('[Triggers] Unlink Action', props<{ triggerId: string; actionId: string }>());
export const unlinkActionSuccess = createAction('[Triggers] Unlink Action Success');
export const unlinkActionFailure = createAction('[Triggers] Unlink Action Failure', props<{ error: string }>());

export const selectTrigger = createAction('[Triggers] Select Trigger', props<{ trigger: Trigger | null }>());
