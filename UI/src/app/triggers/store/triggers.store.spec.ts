import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { TriggersEffects } from './effects/triggers.effects';
import { TriggersApiService } from './api/triggers.service';
import {
  createTrigger, createTriggerFailure, createTriggerSuccess,
  deleteTrigger, deleteTriggerFailure, deleteTriggerSuccess,
  loadTriggers, loadTriggersFailure, loadTriggersSuccess,
  selectTrigger,
  updateTrigger, updateTriggerFailure, updateTriggerSuccess,
} from './actions/triggers.actions';
import { initialTriggersState, triggersReducer, selectAllTriggers, selectTriggersIsLoading, selectTriggersError, selectSelectedTrigger } from './reducers/triggers.reducer';
import { Trigger } from './models/trigger.model';

const mockTrigger: Trigger = {
  id: '1',
  phrase: "What's the price of",
  actionId: 'action-1',
  actionType: 'Query',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockTrigger2: Trigger = {
  id: '2',
  phrase: 'How much is',
  actionId: 'action-2',
  actionType: 'Add',
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

// ── Reducer Tests ─────────────────────────────────────────────────────────────

describe('triggersReducer', () => {
  it('should return initial state', () => {
    const state = triggersReducer(undefined, { type: '@@UNKNOWN' } as Action);
    expect(state).toEqual(initialTriggersState);
  });

  it('should set isLoading=true on loadTriggers', () => {
    const state = triggersReducer(initialTriggersState, loadTriggers());
    expect(state.isLoading).toBe(true);
  });

  it('should populate triggers on loadTriggersSuccess', () => {
    const state = triggersReducer(initialTriggersState, loadTriggersSuccess({ triggers: [mockTrigger] }));
    expect(state.triggers).toEqual([mockTrigger]);
    expect(state.isLoading).toBe(false);
  });

  it('should append trigger on createTriggerSuccess', () => {
    const state = triggersReducer(initialTriggersState, createTriggerSuccess({ trigger: mockTrigger }));
    expect(state.triggers).toContain(mockTrigger);
  });

  it('should replace trigger on updateTriggerSuccess', () => {
    const updatedTrigger: Trigger = { ...mockTrigger, phrase: 'Updated phrase' };
    const withTrigger = { ...initialTriggersState, triggers: [mockTrigger, mockTrigger2] };
    const state = triggersReducer(withTrigger, updateTriggerSuccess({ trigger: updatedTrigger }));
    expect(state.triggers).toHaveLength(2);
    expect(state.triggers.find((t) => t.id === '1')?.phrase).toBe('Updated phrase');
    expect(state.isLoading).toBe(false);
  });

  it('should clear selectedTrigger on updateTriggerSuccess', () => {
    const withSelected = { ...initialTriggersState, triggers: [mockTrigger], selectedTrigger: mockTrigger };
    const state = triggersReducer(withSelected, updateTriggerSuccess({ trigger: mockTrigger }));
    expect(state.selectedTrigger).toBeNull();
  });

  it('should set error on updateTriggerFailure', () => {
    const state = triggersReducer(initialTriggersState, updateTriggerFailure({ error: 'Update failed' }));
    expect(state.error).toBe('Update failed');
    expect(state.isLoading).toBe(false);
  });

  it('should remove trigger on deleteTriggerSuccess', () => {
    const withTriggers = { ...initialTriggersState, triggers: [mockTrigger] };
    const state = triggersReducer(withTriggers, deleteTriggerSuccess({ id: '1' }));
    expect(state.triggers).toHaveLength(0);
  });

  it('should set error on loadTriggersFailure', () => {
    const state = triggersReducer(initialTriggersState, loadTriggersFailure({ error: 'Error' }));
    expect(state.error).toBe('Error');
    expect(state.isLoading).toBe(false);
  });

  it('selectTrigger: should set selectedTrigger', () => {
    const state = triggersReducer(initialTriggersState, selectTrigger({ trigger: mockTrigger }));
    expect(state.selectedTrigger).toEqual(mockTrigger);
  });

  it('selectTrigger with null: should clear selectedTrigger', () => {
    const withSelected = { ...initialTriggersState, selectedTrigger: mockTrigger };
    const state = triggersReducer(withSelected, selectTrigger({ trigger: null }));
    expect(state.selectedTrigger).toBeNull();
  });

  it('should set error on deleteTriggerFailure', () => {
    const state = triggersReducer(initialTriggersState, deleteTriggerFailure({ error: 'Delete failed' }));
    expect(state.error).toBe('Delete failed');
    expect(state.isLoading).toBe(false);
  });
});

// ── Selector Tests ────────────────────────────────────────────────────────────

describe('triggers selectors', () => {
  it('selectAllTriggers should return triggers', () => {
    const state = { triggers: { ...initialTriggersState, triggers: [mockTrigger] } };
    expect(selectAllTriggers(state)).toEqual([mockTrigger]);
  });

  it('selectTriggersIsLoading should return loading state', () => {
    const state = { triggers: { ...initialTriggersState, isLoading: true } };
    expect(selectTriggersIsLoading(state)).toBe(true);
  });

  it('selectSelectedTrigger should return selectedTrigger', () => {
    const state = { triggers: { ...initialTriggersState, selectedTrigger: mockTrigger } };
    expect(selectSelectedTrigger(state)).toEqual(mockTrigger);
  });

  it('selectTriggersError should return the error', () => {
    const state = { triggers: { ...initialTriggersState, error: 'Something failed' } };
    expect(selectTriggersError(state)).toBe('Something failed');
  });
});

// ── Effects Tests ─────────────────────────────────────────────────────────────

describe('TriggersEffects', () => {
  let actions$: Observable<Action>;
  let effects: TriggersEffects;
  let triggersServiceMock: jest.Mocked<TriggersApiService>;

  beforeEach(() => {
    triggersServiceMock = {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TriggersApiService>;

    TestBed.configureTestingModule({
      providers: [
        TriggersEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: TriggersApiService, useValue: triggersServiceMock },
      ],
    });

    effects = TestBed.inject(TriggersEffects);
  });

  it('should dispatch loadTriggersSuccess on successful load', (done) => {
    triggersServiceMock.getAll.mockReturnValue(of([mockTrigger]));
    actions$ = of(loadTriggers());
    effects.loadTriggers$.subscribe((action) => {
      expect(action).toEqual(loadTriggersSuccess({ triggers: [mockTrigger] }));
      done();
    });
  });

  it('should dispatch loadTriggersFailure on error', (done) => {
    triggersServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));
    actions$ = of(loadTriggers());
    effects.loadTriggers$.subscribe((action) => {
      expect(action).toEqual(loadTriggersFailure({ error: 'Network error' }));
      done();
    });
  });

  it('should dispatch createTriggerSuccess on successful create', (done) => {
    triggersServiceMock.create.mockReturnValue(of(mockTrigger));
    actions$ = of(createTrigger({ request: { phrase: "What's the price of", actionId: 'action-1' } }));
    effects.createTrigger$.subscribe((action) => {
      expect(action).toEqual(createTriggerSuccess({ trigger: mockTrigger }));
      done();
    });
  });

  it('should dispatch createTriggerFailure on create error', (done) => {
    triggersServiceMock.create.mockReturnValue(throwError(() => new Error('Server error')));
    actions$ = of(createTrigger({ request: { phrase: 'test', actionId: 'action-1' } }));
    effects.createTrigger$.subscribe((action) => {
      expect(action).toEqual(createTriggerFailure({ error: 'Server error' }));
      done();
    });
  });

  it('should dispatch updateTriggerSuccess on successful update', (done) => {
    const updatedTrigger: Trigger = { ...mockTrigger, phrase: 'Updated phrase' };
    triggersServiceMock.update.mockReturnValue(of(updatedTrigger));
    actions$ = of(updateTrigger({ id: '1', request: { phrase: 'Updated phrase', actionId: 'action-1' } }));
    effects.updateTrigger$.subscribe((action) => {
      expect(action).toEqual(updateTriggerSuccess({ trigger: updatedTrigger }));
      done();
    });
  });

  it('should dispatch updateTriggerFailure on update error', (done) => {
    triggersServiceMock.update.mockReturnValue(throwError(() => new Error('Not found')));
    actions$ = of(updateTrigger({ id: 'bad-id', request: { phrase: 'phrase', actionId: 'action-1' } }));
    effects.updateTrigger$.subscribe((action) => {
      expect(action).toEqual(updateTriggerFailure({ error: 'Not found' }));
      done();
    });
  });

  it('should dispatch deleteTriggerSuccess on successful delete', (done) => {
    triggersServiceMock.delete.mockReturnValue(of(void 0));
    actions$ = of(deleteTrigger({ id: '1' }));
    effects.deleteTrigger$.subscribe((action) => {
      expect(action).toEqual(deleteTriggerSuccess({ id: '1' }));
      done();
    });
  });

  it('should dispatch loadTriggersFailure with fallback message for non-Error', (done) => {
    triggersServiceMock.getAll.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(loadTriggers());
    effects.loadTriggers$.subscribe((action) => {
      expect(action).toEqual(loadTriggersFailure({ error: 'Failed to load triggers.' }));
      done();
    });
  });

  it('should dispatch createTriggerFailure with fallback message for non-Error', (done) => {
    triggersServiceMock.create.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(createTrigger({ request: { phrase: 'test', actionId: 'action-1' } }));
    effects.createTrigger$.subscribe((action) => {
      expect(action).toEqual(createTriggerFailure({ error: 'Failed to create trigger.' }));
      done();
    });
  });

  it('should dispatch updateTriggerFailure with fallback message for non-Error', (done) => {
    triggersServiceMock.update.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(updateTrigger({ id: '1', request: { phrase: 'phrase', actionId: 'action-1' } }));
    effects.updateTrigger$.subscribe((action) => {
      expect(action).toEqual(updateTriggerFailure({ error: 'Failed to update trigger.' }));
      done();
    });
  });

  it('should dispatch deleteTriggerFailure with fallback message for non-Error', (done) => {
    triggersServiceMock.delete.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(deleteTrigger({ id: '1' }));
    effects.deleteTrigger$.subscribe((action) => {
      expect(action).toEqual(deleteTriggerFailure({ error: 'Failed to delete trigger.' }));
      done();
    });
  });
});
