import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { commandFailure, commandSuccess, confirmAdd, confirmAddFailure, confirmAddSuccess, dismissConfirmation, sendCommand, startListening, stopListening, transcriptReceived } from '../actions/voice.actions';
import { VoiceState } from '../models/voice.model';

const VOICE_FEATURE_KEY = 'voice';

export const initialVoiceState: VoiceState = {
  isListening: false,
  transcript: null,
  commandResult: null,
  isProcessing: false,
  error: null,
};

export const voiceReducer = createReducer(
  initialVoiceState,
  on(startListening, (state) => ({ ...state, isListening: true, error: null })),
  on(stopListening, (state) => ({ ...state, isListening: false })),
  on(transcriptReceived, (state, { transcript }) => ({ ...state, transcript })),
  on(sendCommand, confirmAdd, (state) => ({ ...state, isProcessing: true, error: null, commandResult: null })),
  on(commandSuccess, confirmAddSuccess, (state, { result }) => ({
    ...state,
    isProcessing: false,
    commandResult: result,
    isListening: false,
  })),
  on(commandFailure, confirmAddFailure, (state, { error }) => ({
    ...state,
    isProcessing: false,
    error,
    isListening: false,
  })),
  on(dismissConfirmation, (state) => ({
    ...state,
    commandResult: state.commandResult
      ? { ...state.commandResult, isConfirmationRequired: false }
      : null,
  }))
);

export const selectVoiceState = createFeatureSelector<VoiceState>(VOICE_FEATURE_KEY);
export const selectIsListening = createSelector(selectVoiceState, (s) => s.isListening);
export const selectIsProcessing = createSelector(selectVoiceState, (s) => s.isProcessing);
export const selectCommandResult = createSelector(selectVoiceState, (s) => s.commandResult);
export const selectIsConfirmationRequired = createSelector(selectVoiceState, (s) => s.commandResult?.isConfirmationRequired ?? false);
