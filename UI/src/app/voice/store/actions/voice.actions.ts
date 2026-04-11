import { createAction, props } from '@ngrx/store';
import { ConfirmAddRequest, VoiceCommandResult } from '../models/voice.model';

export const startListening = createAction('[Voice] Start Listening');
export const stopListening = createAction('[Voice] Stop Listening');
export const transcriptReceived = createAction('[Voice] Transcript Received', props<{ transcript: string }>());
export const sendCommand = createAction('[Voice] Send Command', props<{ transcript: string }>());
export const commandSuccess = createAction('[Voice] Command Success', props<{ result: VoiceCommandResult }>());
export const commandFailure = createAction('[Voice] Command Failure', props<{ error: string }>());
export const confirmAdd = createAction('[Voice] Confirm Add', props<{ request: ConfirmAddRequest }>());
export const confirmAddSuccess = createAction('[Voice] Confirm Add Success', props<{ result: VoiceCommandResult }>());
export const confirmAddFailure = createAction('[Voice] Confirm Add Failure', props<{ error: string }>());
export const dismissConfirmation = createAction('[Voice] Dismiss Confirmation');
