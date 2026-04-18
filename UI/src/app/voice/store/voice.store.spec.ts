import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { VoiceEffects } from './effects/voice.effects';
import { VoiceApiService } from './api/voice.service';
import { SpeechSynthesisService } from '../../shared/services/speech-synthesis.service';
import { SpeechRecognitionService } from '../../shared/services/speech-recognition.service';
import {
  commandFailure, commandSuccess,
  dismissConfirmation, sendCommand, startListening, stopListening, transcriptReceived,
} from './actions/voice.actions';
import { initialVoiceState, voiceReducer, selectCommandResult, selectIsConfirmationRequired, selectIsListening, selectIsProcessing, selectPendingState } from './reducers/voice.reducer';
import { VoiceCommandResult, VoiceState } from './models/voice.model';
import { loadItems } from '../../items/store/actions/items.actions';

const mockResult: VoiceCommandResult = {
  responseText: 'Milk costs 50 pesos.',
  isAmbiguous: false,
  isConfirmationRequired: false,
  matchedNames: null,
  itemsModified: false,
  pendingIntent: null,
  pendingItemName: null,
};

const mockPendingAddResult: VoiceCommandResult = {
  responseText: 'What is the price of Sugar?',
  isAmbiguous: false,
  isConfirmationRequired: false,
  matchedNames: null,
  itemsModified: false,
  pendingIntent: 'Add',
  pendingItemName: 'Sugar',
};

const mockPendingUpdateResult: VoiceCommandResult = {
  responseText: 'What is the new price of Milk?',
  isAmbiguous: false,
  isConfirmationRequired: false,
  matchedNames: null,
  itemsModified: false,
  pendingIntent: 'Update',
  pendingItemName: 'Milk',
};

const mockConfirmUpdateResult: VoiceCommandResult = {
  responseText: 'Milk already exists. Do you want to update it?',
  isAmbiguous: false,
  isConfirmationRequired: true,
  matchedNames: null,
  itemsModified: false,
  pendingIntent: 'ConfirmUpdate',
  pendingItemName: 'Milk',
};

// ── Reducer Tests ─────────────────────────────────────────────────────────────

describe('voiceReducer', () => {
  it('should return initial state', () => {
    const state = voiceReducer(undefined, { type: '@@UNKNOWN' } as Action);
    expect(state).toEqual(initialVoiceState);
  });

  it('should set isListening=true on startListening', () => {
    const state = voiceReducer(initialVoiceState, startListening());
    expect(state.isListening).toBe(true);
  });

  it('should set isListening=false on stopListening', () => {
    const state = voiceReducer({ ...initialVoiceState, isListening: true }, stopListening());
    expect(state.isListening).toBe(false);
  });

  it('should update transcript on transcriptReceived', () => {
    const state = voiceReducer(initialVoiceState, transcriptReceived({ transcript: 'How much is Milk?' }));
    expect(state.transcript).toBe('How much is Milk?');
  });

  it('should set isProcessing=true on sendCommand', () => {
    const state = voiceReducer(initialVoiceState, sendCommand({ transcript: 'how much is milk' }));
    expect(state.isProcessing).toBe(true);
    expect(state.commandResult).toBeNull();
  });

  it('should store commandResult on commandSuccess', () => {
    const state = voiceReducer(initialVoiceState, commandSuccess({ result: mockResult }));
    expect(state.commandResult).toEqual(mockResult);
    expect(state.isProcessing).toBe(false);
    expect(state.isListening).toBe(false);
  });

  it('should store pendingIntent and pendingItemName from result on commandSuccess', () => {
    const state = voiceReducer(initialVoiceState, commandSuccess({ result: mockPendingAddResult }));
    expect(state.pendingIntent).toBe('Add');
    expect(state.pendingItemName).toBe('Sugar');
  });

  it('should clear pendingIntent and pendingItemName when result has no pending on commandSuccess', () => {
    const stateWithPending: VoiceState = {
      ...initialVoiceState,
      pendingIntent: 'Add',
      pendingItemName: 'Sugar',
    };
    const state = voiceReducer(stateWithPending, commandSuccess({ result: mockResult }));
    expect(state.pendingIntent).toBeNull();
    expect(state.pendingItemName).toBeNull();
  });

  it('should set error on commandFailure', () => {
    const state = voiceReducer(initialVoiceState, commandFailure({ error: 'Network error' }));
    expect(state.error).toBe('Network error');
    expect(state.isProcessing).toBe(false);
  });

  it('should clear pending state and isConfirmationRequired on dismissConfirmation', () => {
    const withConfirmation: VoiceState = {
      ...initialVoiceState,
      pendingIntent: 'ConfirmUpdate',
      pendingItemName: 'Milk',
      commandResult: mockConfirmUpdateResult,
    };
    const state = voiceReducer(withConfirmation, dismissConfirmation());
    expect(state.pendingIntent).toBeNull();
    expect(state.pendingItemName).toBeNull();
    expect(state.commandResult?.isConfirmationRequired).toBe(false);
  });

  it('should leave commandResult null when dismissConfirmation called with no result', () => {
    const state = voiceReducer(initialVoiceState, dismissConfirmation());
    expect(state.commandResult).toBeNull();
  });
});

// ── Selector Tests ────────────────────────────────────────────────────────────

describe('voice selectors', () => {
  it('selectIsListening should return listening state', () => {
    const state = { voice: { ...initialVoiceState, isListening: true } };
    expect(selectIsListening(state)).toBe(true);
  });

  it('selectIsProcessing should return processing state', () => {
    const state = { voice: { ...initialVoiceState, isProcessing: true } };
    expect(selectIsProcessing(state)).toBe(true);
  });

  it('selectCommandResult should return the command result', () => {
    const state = { voice: { ...initialVoiceState, commandResult: mockResult } };
    expect(selectCommandResult(state)).toEqual(mockResult);
  });

  it('selectIsConfirmationRequired should be true when pendingIntent is ConfirmUpdate', () => {
    const state = { voice: { ...initialVoiceState, pendingIntent: 'ConfirmUpdate' } };
    expect(selectIsConfirmationRequired(state)).toBe(true);
  });

  it('selectIsConfirmationRequired should be false when pendingIntent is Add', () => {
    const state = { voice: { ...initialVoiceState, pendingIntent: 'Add' } };
    expect(selectIsConfirmationRequired(state)).toBe(false);
  });

  it('selectIsConfirmationRequired should be false when pendingIntent is null', () => {
    const state = { voice: { ...initialVoiceState, pendingIntent: null } };
    expect(selectIsConfirmationRequired(state)).toBe(false);
  });

  it('selectPendingState should return pendingIntent and pendingItemName', () => {
    const state = { voice: { ...initialVoiceState, pendingIntent: 'Update', pendingItemName: 'Milk' } };
    expect(selectPendingState(state)).toEqual({ pendingIntent: 'Update', pendingItemName: 'Milk' });
  });
});

// ── Effects Tests ─────────────────────────────────────────────────────────────

describe('VoiceEffects', () => {
  let actions$: Observable<Action>;
  let effects: VoiceEffects;
  let voiceServiceMock: jest.Mocked<VoiceApiService>;
  let speechSynthesisMock: jest.Mocked<SpeechSynthesisService>;
  let speechRecognitionMock: { startListening: jest.Mock };

  beforeEach(() => {
    voiceServiceMock = { sendCommand: jest.fn() } as unknown as jest.Mocked<VoiceApiService>;
    speechSynthesisMock = { speak: jest.fn().mockReturnValue(of(undefined)) } as unknown as jest.Mocked<SpeechSynthesisService>;
    speechRecognitionMock = { startListening: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        VoiceEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { voice: initialVoiceState } }),
        { provide: VoiceApiService, useValue: voiceServiceMock },
        { provide: SpeechSynthesisService, useValue: speechSynthesisMock },
        { provide: SpeechRecognitionService, useValue: speechRecognitionMock },
      ],
    });

    effects = TestBed.inject(VoiceEffects);
  });

  it('should dispatch commandSuccess on successful voice command', (done) => {
    voiceServiceMock.sendCommand.mockReturnValue(of(mockResult));

    actions$ = of(sendCommand({ transcript: 'how much is milk?' }));

    effects.sendCommand$.subscribe((action) => {
      expect(action).toEqual(commandSuccess({ result: mockResult }));
      done();
    });
  });

  it('should pass null pending context when store has no pending state', (done) => {
    voiceServiceMock.sendCommand.mockReturnValue(of(mockResult));

    actions$ = of(sendCommand({ transcript: 'how much is milk?' }));

    effects.sendCommand$.subscribe(() => {
      expect(voiceServiceMock.sendCommand).toHaveBeenCalledWith('how much is milk?', null, null);
      done();
    });
  });

  it('should pass pending context from store when available', (done) => {
    voiceServiceMock.sendCommand.mockReturnValue(of(mockResult));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        VoiceEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
            voice: { ...initialVoiceState, pendingIntent: 'Add', pendingItemName: 'Sugar' },
          },
        }),
        { provide: VoiceApiService, useValue: voiceServiceMock },
        { provide: SpeechSynthesisService, useValue: speechSynthesisMock },
        { provide: SpeechRecognitionService, useValue: speechRecognitionMock },
      ],
    });
    effects = TestBed.inject(VoiceEffects);

    actions$ = of(sendCommand({ transcript: '50' }));

    effects.sendCommand$.subscribe(() => {
      expect(voiceServiceMock.sendCommand).toHaveBeenCalledWith('50', 'Add', 'Sugar');
      done();
    });
  });

  it('should dispatch commandFailure on error', (done) => {
    voiceServiceMock.sendCommand.mockReturnValue(throwError(() => new Error('Timeout')));

    actions$ = of(sendCommand({ transcript: 'how much is milk?' }));

    effects.sendCommand$.subscribe((action) => {
      expect(action).toEqual(commandFailure({ error: 'Timeout' }));
      done();
    });
  });

  it('should dispatch commandFailure with fallback message for non-Error', (done) => {
    voiceServiceMock.sendCommand.mockReturnValue(throwError(() => ({ code: 500 })));

    actions$ = of(sendCommand({ transcript: 'how much is milk?' }));

    effects.sendCommand$.subscribe((action) => {
      expect(action).toEqual(commandFailure({ error: 'Command failed.' }));
      done();
    });
  });

  describe('speakResponse$', () => {
    it('should call speechSynthesis.speak when result has no pending intent', (done) => {
      actions$ = of(commandSuccess({ result: mockResult }));

      effects.speakResponse$.subscribe(() => {
        expect(speechSynthesisMock.speak).toHaveBeenCalledWith(mockResult.responseText);
        done();
      });
    });

    it('should NOT call speechSynthesis.speak when pendingIntent is ConfirmUpdate', (done) => {
      const dispatched: unknown[] = [];
      actions$ = of(commandSuccess({ result: mockConfirmUpdateResult }));

      effects.speakResponse$.subscribe({
        next: (v) => dispatched.push(v),
        complete: () => {
          expect(dispatched).toHaveLength(0);
          expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should NOT call speechSynthesis.speak when pendingIntent is Add', (done) => {
      const dispatched: unknown[] = [];
      actions$ = of(commandSuccess({ result: mockPendingAddResult }));

      effects.speakResponse$.subscribe({
        next: (v) => dispatched.push(v),
        complete: () => {
          expect(dispatched).toHaveLength(0);
          expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should NOT call speechSynthesis.speak when pendingIntent is Update', (done) => {
      const dispatched: unknown[] = [];
      actions$ = of(commandSuccess({ result: mockPendingUpdateResult }));

      effects.speakResponse$.subscribe({
        next: (v) => dispatched.push(v),
        complete: () => {
          expect(dispatched).toHaveLength(0);
          expect(speechSynthesisMock.speak).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('autoListenAfterPending$', () => {
    it('should speak and then auto-start mic when pendingIntent is Add', (done) => {
      actions$ = of(commandSuccess({ result: mockPendingAddResult }));

      effects.autoListenAfterPending$.subscribe(() => {
        expect(speechSynthesisMock.speak).toHaveBeenCalledWith(mockPendingAddResult.responseText);
        expect(speechRecognitionMock.startListening).toHaveBeenCalled();
        done();
      });
    });

    it('should speak and then auto-start mic when pendingIntent is Update', (done) => {
      actions$ = of(commandSuccess({ result: mockPendingUpdateResult }));

      effects.autoListenAfterPending$.subscribe(() => {
        expect(speechSynthesisMock.speak).toHaveBeenCalledWith(mockPendingUpdateResult.responseText);
        expect(speechRecognitionMock.startListening).toHaveBeenCalled();
        done();
      });
    });

    it('should NOT trigger auto-listen when result has no pending intent', (done) => {
      const dispatched: unknown[] = [];
      actions$ = of(commandSuccess({ result: mockResult }));

      effects.autoListenAfterPending$.subscribe({
        next: (v) => dispatched.push(v),
        complete: () => {
          expect(dispatched).toHaveLength(0);
          expect(speechRecognitionMock.startListening).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should speak and then auto-start mic when pendingIntent is ConfirmUpdate', (done) => {
      actions$ = of(commandSuccess({ result: mockConfirmUpdateResult }));

      effects.autoListenAfterPending$.subscribe(() => {
        expect(speechSynthesisMock.speak).toHaveBeenCalledWith(mockConfirmUpdateResult.responseText);
        expect(speechRecognitionMock.startListening).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should dispatch loadItems when commandSuccess has itemsModified=true', (done) => {
    const mutatingResult: VoiceCommandResult = { ...mockResult, itemsModified: true };

    actions$ = of(commandSuccess({ result: mutatingResult }));

    effects.refetchItemsAfterMutation$.subscribe((action) => {
      expect(action).toEqual(loadItems());
      done();
    });
  });

  it('should not dispatch loadItems when commandSuccess has itemsModified=false', (done) => {
    const dispatched: unknown[] = [];
    actions$ = of(commandSuccess({ result: mockResult }));

    effects.refetchItemsAfterMutation$.subscribe({
      next: (action) => dispatched.push(action),
      complete: () => {
        expect(dispatched).toHaveLength(0);
        done();
      },
    });
  });
});
