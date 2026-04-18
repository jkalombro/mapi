import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { commandFailure, commandSuccess, dismissConfirmation, sendCommand, startListening, stopListening, transcriptReceived } from '../actions/voice.actions';
import { VoiceState } from '../models/voice.model';

const VOICE_FEATURE_KEY = 'voice';
const PENDING_INTENT_CONFIRM_UPDATE = 'ConfirmUpdate';

export const initialVoiceState: VoiceState = {
  isListening: false,
  transcript: null,
  commandResult: null,
  isProcessing: false,
  error: null,
  pendingIntent: null,
  pendingItemName: null,
};

export const voiceReducer = createReducer(
  initialVoiceState,
  on(startListening, (state) => ({ ...state, isListening: true, error: null })),
  on(stopListening, (state) => ({ ...state, isListening: false })),
  on(transcriptReceived, (state, { transcript }) => ({ ...state, transcript })),
  on(sendCommand, (state) => ({ ...state, isProcessing: true, error: null, commandResult: null })),
  on(commandSuccess, (state, { result }) => ({
    ...state,
    isProcessing: false,
    commandResult: result,
    isListening: false,
    pendingIntent: result.pendingIntent ?? null,
    pendingItemName: result.pendingItemName ?? null,
  })),
  on(commandFailure, (state, { error }) => ({
    ...state,
    isProcessing: false,
    error,
    isListening: false,
  })),
  on(dismissConfirmation, (state) => ({
    ...state,
    pendingIntent: null,
    pendingItemName: null,
    commandResult: state.commandResult
      ? { ...state.commandResult, isConfirmationRequired: false }
      : null,
  }))
);

export const selectVoiceState = createFeatureSelector<VoiceState>(VOICE_FEATURE_KEY);
export const selectIsListening = createSelector(selectVoiceState, (s) => s.isListening);
export const selectIsProcessing = createSelector(selectVoiceState, (s) => s.isProcessing);
export const selectCommandResult = createSelector(selectVoiceState, (s) => s.commandResult);
export const selectPendingState = createSelector(selectVoiceState, (s) => ({
  pendingIntent: s.pendingIntent,
  pendingItemName: s.pendingItemName,
}));
export const selectIsConfirmationRequired = createSelector(
  selectVoiceState,
  (s) => s.pendingIntent === PENDING_INTENT_CONFIRM_UPDATE
);
