import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ActionsEffects } from './actions.effects';
import { ActionsApiService } from '../../../shared/services/actions-api.service';
import {
  createActionFailure,
  createActionSuccess,
  createNewAction,
  deleteAction,
  deleteActionFailure,
  deleteActionSuccess,
  loadActions,
  loadActionsFailure,
  loadActionsSuccess,
  updateAction,
  updateActionFailure,
  updateActionSuccess,
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
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  // =========================================================
  // loadActions$
  // =========================================================

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

  // =========================================================
  // createNewAction$
  // =========================================================

  it('createNewAction$: should dispatch createActionSuccess on API success', (done) => {
    actionsApiService.create.mockReturnValue(of(mockAction));
    actions$ = of(createNewAction({ request: { actionType: 'Query', responseTemplate: 'Template' } }));

    effects.createNewAction$.subscribe((result) => {
      expect(result).toEqual(createActionSuccess({ action: mockAction }));
      done();
    });
  });

  it('createNewAction$: should dispatch createActionFailure on API error', (done) => {
    actionsApiService.create.mockReturnValue(throwError(() => new Error('Validation error')));
    actions$ = of(createNewAction({ request: { actionType: 'Query', responseTemplate: '' } }));

    effects.createNewAction$.subscribe((result) => {
      expect(result).toEqual(createActionFailure({ error: 'Validation error' }));
      done();
    });
  });

  // =========================================================
  // updateAction$
  // =========================================================

  it('updateAction$: should dispatch updateActionSuccess on API success', (done) => {
    const updatedAction: ActionModel = { ...mockAction, responseTemplate: 'Updated' };
    actionsApiService.update.mockReturnValue(of(updatedAction));
    actions$ = of(updateAction({ id: 'action-1', request: { responseTemplate: 'Updated' } }));

    effects.updateAction$.subscribe((result) => {
      expect(result).toEqual(updateActionSuccess({ action: updatedAction }));
      done();
    });
  });

  it('updateAction$: should dispatch updateActionFailure on API error', (done) => {
    actionsApiService.update.mockReturnValue(throwError(() => new Error('Not found')));
    actions$ = of(updateAction({ id: 'bad-id', request: { responseTemplate: 'Template' } }));

    effects.updateAction$.subscribe((result) => {
      expect(result).toEqual(updateActionFailure({ error: 'Not found' }));
      done();
    });
  });

  // =========================================================
  // deleteAction$
  // =========================================================

  it('deleteAction$: should dispatch deleteActionSuccess on API success', (done) => {
    actionsApiService.delete.mockReturnValue(of(undefined as unknown as void));
    actions$ = of(deleteAction({ id: 'action-1' }));

    effects.deleteAction$.subscribe((result) => {
      expect(result).toEqual(deleteActionSuccess({ id: 'action-1' }));
      done();
    });
  });

  it('deleteAction$: should dispatch deleteActionFailure on 409 Conflict', (done) => {
    const conflictError = { status: 409, error: { detail: 'Action is linked to a trigger.' } };
    actionsApiService.delete.mockReturnValue(throwError(() => conflictError));
    actions$ = of(deleteAction({ id: 'action-1' }));

    effects.deleteAction$.subscribe((result) => {
      expect(result).toEqual(deleteActionFailure({ error: 'Action is linked to a trigger.' }));
      done();
    });
  });

  it('deleteAction$: should dispatch deleteActionFailure with default message on other errors', (done) => {
    actionsApiService.delete.mockReturnValue(throwError(() => new Error('Server error')));
    actions$ = of(deleteAction({ id: 'action-1' }));

    effects.deleteAction$.subscribe((result) => {
      expect(result).toEqual(deleteActionFailure({ error: 'Server error' }));
      done();
    });
  });

  it('createNewAction$: should dispatch createActionFailure with fallback message for non-Error', (done) => {
    actionsApiService.create.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(createNewAction({ request: { actionType: 'Query', responseTemplate: 'Template' } }));

    effects.createNewAction$.subscribe((result) => {
      expect(result).toEqual(createActionFailure({ error: 'Failed to create action.' }));
      done();
    });
  });

  it('updateAction$: should dispatch updateActionFailure with fallback message for non-Error', (done) => {
    actionsApiService.update.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(updateAction({ id: 'action-1', request: { responseTemplate: 'Template' } }));

    effects.updateAction$.subscribe((result) => {
      expect(result).toEqual(updateActionFailure({ error: 'Failed to update action.' }));
      done();
    });
  });

  it('deleteAction$: should dispatch deleteActionFailure with fallback 409 message when detail is missing', (done) => {
    actionsApiService.delete.mockReturnValue(throwError(() => ({ status: 409, error: {} })));
    actions$ = of(deleteAction({ id: 'action-1' }));

    effects.deleteAction$.subscribe((result) => {
      expect(result).toEqual(deleteActionFailure({ error: 'Action is linked to a trigger and cannot be deleted.' }));
      done();
    });
  });

  it('deleteAction$: should dispatch deleteActionFailure with fallback message for non-Error non-409', (done) => {
    actionsApiService.delete.mockReturnValue(throwError(() => ({ code: 500 })));
    actions$ = of(deleteAction({ id: 'action-1' }));

    effects.deleteAction$.subscribe((result) => {
      expect(result).toEqual(deleteActionFailure({ error: 'Failed to delete action.' }));
      done();
    });
  });
});
