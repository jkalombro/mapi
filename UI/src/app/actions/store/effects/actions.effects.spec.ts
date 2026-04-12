import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ActionsEffects } from './actions.effects';
import { ActionsApiService } from '../../../shared/services/actions-api.service';
import {
  loadActions,
  loadActionsFailure,
  loadActionsSuccess,
} from '../actions/actions.actions';
import { Action as ActionModel } from '../models/action.model';

describe('ActionsEffects', () => {
  let actions$: Observable<Action>;
  let effects: ActionsEffects;
  let actionsApiService: jest.Mocked<ActionsApiService>;

  const mockAction: ActionModel = {
    id: 'action-1',
    actionType: 'Query',
    responseTemplate: 'The price is {price}.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    const apiServiceMock = {
      getAll: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ActionsEffects,
        provideMockActions(() => actions$),
        { provide: ActionsApiService, useValue: apiServiceMock },
      ],
    });

    effects = TestBed.inject(ActionsEffects);
    actionsApiService = TestBed.inject(ActionsApiService) as jest.Mocked<ActionsApiService>;
  });

  it('loadActions$: should dispatch loadActionsSuccess on API success', (done) => {
    actionsApiService.getAll.mockReturnValue(of([mockAction]));
    actions$ = of(loadActions());

    effects.loadActions$.subscribe((result) => {
      expect(result).toEqual(loadActionsSuccess({ actions: [mockAction] }));
      done();
    });
  });

  it('loadActions$: should dispatch loadActionsFailure on API error', (done) => {
    actionsApiService.getAll.mockReturnValue(throwError(() => new Error('Network error')));
    actions$ = of(loadActions());

    effects.loadActions$.subscribe((result) => {
      expect(result).toEqual(loadActionsFailure({ error: 'Network error' }));
      done();
    });
  });

  it('loadActions$: should dispatch loadActionsFailure with default message on unknown error', (done) => {
    actionsApiService.getAll.mockReturnValue(throwError(() => 'unknown'));
    actions$ = of(loadActions());

    effects.loadActions$.subscribe((result) => {
      expect(result).toEqual(loadActionsFailure({ error: 'Failed to load actions.' }));
      done();
    });
  });
});
