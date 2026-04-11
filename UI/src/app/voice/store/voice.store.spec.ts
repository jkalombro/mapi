import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { VoiceEffects } from './effects/voice.effects';
import { VoiceApiService } from './api/voice.service';
import { SpeechSynthesisService } from '../../shared/services/speech-synthesis.service';
import {
  commandFailure, commandSuccess, confirmAdd, confirmAddFailure, confirmAddSuccess,
  dismissConfirmation, sendCommand, startListening, stopListening, transcriptReceived,
} from './actions/voice.actions';
import { initialVoiceState, voiceReducer, selectCommandResult, selectIsConfirmationRequired, selectIsListening, selectIsProcessing } from './reducers/voice.reducer';
import { VoiceCommandResult } from './models/voice.model';

const mockResult: VoiceCommandResult = {
  responseText: 'Milk costs 50 pesos.',
  isAmbiguous: false,
  isConfirmationRequired: false,
  matchedNames: null,
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

  it('should set error on commandFailure', () => {
    const state = voiceReducer(initialVoiceState, commandFailure({ error: 'Network error' }));
    expect(state.error).toBe('Network error');
    expect(state.isProcessing).toBe(false);
  });

  it('should clear isConfirmationRequired on dismissConfirmation', () => {
    const withConfirmation = {
      ...initialVoiceState,
      commandResult: { ...mockResult, isConfirmationRequired: true },
    };
    const state = voiceReducer(withConfirmation, dismissConfirmation());
    expect(state.commandResult?.isConfirmationRequired).toBe(false);
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

  it('selectIsConfirmationRequired should be true when result has confirmation', () => {
    const result = { ...mockResult, isConfirmationRequired: true };
    const state = { voice: { ...initialVoiceState, commandResult: result } };
    expect(selectIsConfirmationRequired(state)).toBe(true);
  });

  it('selectIsConfirmationRequired should be false when no command result', () => {
    const state = { voice: { ...initialVoiceState, commandResult: null } };
    expect(selectIsConfirmationRequired(state)).toBe(false);
  });
});

// ── Effects Tests ─────────────────────────────────────────────────────────────

describe('VoiceEffects', () => {
  let actions$: Observable<Action>;
  let effects: VoiceEffects;
  let voiceServiceMock: jest.Mocked<VoiceApiService>;
  let speechSynthesisMock: jest.Mocked<SpeechSynthesisService>;

  beforeEach(() => {
    voiceServiceMock = { sendCommand: jest.fn(), confirmAdd: jest.fn() } as unknown as jest.Mocked<VoiceApiService>;
    speechSynthesisMock = { speak: jest.fn() } as unknown as jest.Mocked<SpeechSynthesisService>;

    TestBed.configureTestingModule({
      providers: [
        VoiceEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: VoiceApiService, useValue: voiceServiceMock },
        { provide: SpeechSynthesisService, useValue: speechSynthesisMock },
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

  it('should dispatch commandFailure on error', (done) => {
    voiceServiceMock.sendCommand.mockReturnValue(throwError(() => new Error('Timeout')));

    actions$ = of(sendCommand({ transcript: 'how much is milk?' }));

    effects.sendCommand$.subscribe((action) => {
      expect(action).toEqual(commandFailure({ error: 'Timeout' }));
      done();
    });
  });

  it('should dispatch confirmAddSuccess on successful confirmation', (done) => {
    voiceServiceMock.confirmAdd.mockReturnValue(of(mockResult));

    actions$ = of(confirmAdd({ request: { itemName: 'Milk', price: 60 } }));

    effects.confirmAdd$.subscribe((action) => {
      expect(action).toEqual(confirmAddSuccess({ result: mockResult }));
      done();
    });
  });

  it('should call speechSynthesis.speak on commandSuccess', (done) => {
    actions$ = of(commandSuccess({ result: mockResult }));

    effects.speakResponse$.subscribe(() => {
      expect(speechSynthesisMock.speak).toHaveBeenCalledWith(mockResult.responseText);
      done();
    });
  });
});
