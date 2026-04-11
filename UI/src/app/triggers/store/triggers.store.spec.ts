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
  linkAction, linkActionFailure, linkActionSuccess,
  loadTriggers, loadTriggersFailure, loadTriggersSuccess,
  unlinkAction, unlinkActionFailure, unlinkActionSuccess,
} from './actions/triggers.actions';
import { initialTriggersState, triggersReducer, selectAllTriggers, selectTriggersIsLoading } from './reducers/triggers.reducer';
import { Trigger } from './models/trigger.model';

const mockTrigger: Trigger = {
  id: '1',
  phrase: "What's the price of",
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  actions: [],
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
      delete: jest.fn(),
      linkAction: jest.fn(),
      unlinkAction: jest.fn(),
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

    actions$ = of(createTrigger({ request: { phrase: "What's the price of" } }));

    effects.createTrigger$.subscribe((action) => {
      expect(action).toEqual(createTriggerSuccess({ trigger: mockTrigger }));
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

  it('should dispatch linkActionSuccess on successful link', (done) => {
    triggersServiceMock.linkAction.mockReturnValue(of(void 0));

    actions$ = of(linkAction({ triggerId: '1', request: { actionId: '2', sortOrder: 1 } }));

    effects.linkAction$.subscribe((action) => {
      expect(action).toEqual(linkActionSuccess());
      done();
    });
  });

  it('should dispatch unlinkActionSuccess on successful unlink', (done) => {
    triggersServiceMock.unlinkAction.mockReturnValue(of(void 0));

    actions$ = of(unlinkAction({ triggerId: '1', actionId: '2' }));

    effects.unlinkAction$.subscribe((action) => {
      expect(action).toEqual(unlinkActionSuccess());
      done();
    });
  });

  it('should dispatch createTriggerFailure on create error', (done) => {
    triggersServiceMock.create.mockReturnValue(throwError(() => new Error('Server error')));

    actions$ = of(createTrigger({ request: { phrase: 'test' } }));

    effects.createTrigger$.subscribe((action) => {
      expect(action).toEqual(createTriggerFailure({ error: 'Server error' }));
      done();
    });
  });
});
