import { Action as NgRxAction } from '@ngrx/store';
import {
  loadActions,
  loadActionsFailure,
  loadActionsSuccess,
} from '../actions/actions.actions';
import { Action, ActionsState } from '../models/action.model';
import { actionsReducer, initialActionsState, selectAllActions, selectActionsIsLoading, selectActionsError } from './actions.reducer';

const mockAction: Action = {
  id: 'action-1',
  actionType: 'Query',
  responseTemplate: 'The price of {name} is {price}.',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockAction2: Action = {
  id: 'action-2',
  actionType: 'Add',
  responseTemplate: "I've added {item}.",
  createdAt: '2026-01-02T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

function reduce(state: ActionsState, action: NgRxAction): ActionsState {
  return actionsReducer(state, action);
}

describe('ActionsReducer', () => {
  it('should return the initial state for unknown action', () => {
    const state = reduce(undefined as unknown as ActionsState, { type: '@@INIT' });
    expect(state).toEqual(initialActionsState);
  });

  it('loadActions: should set isLoading to true and clear error', () => {
    const state = reduce(
      { ...initialActionsState, error: 'previous error' },
      loadActions()
    );
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('loadActionsSuccess: should populate actions and clear isLoading', () => {
    const state = reduce(
      { ...initialActionsState, isLoading: true },
      loadActionsSuccess({ actions: [mockAction, mockAction2] })
    );
    expect(state.isLoading).toBe(false);
    expect(state.actions).toHaveLength(2);
    expect(state.actions[0].id).toBe('action-1');
  });

  it('loadActionsFailure: should set error and clear isLoading', () => {
    const state = reduce(
      { ...initialActionsState, isLoading: true },
      loadActionsFailure({ error: 'Network error' })
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
  });
});

describe('actions selectors', () => {
  it('selectAllActions should return actions', () => {
    const state = { actions: { ...initialActionsState, actions: [mockAction] } };
    expect(selectAllActions(state)).toEqual([mockAction]);
  });

  it('selectActionsIsLoading should return loading state', () => {
    const state = { actions: { ...initialActionsState, isLoading: true } };
    expect(selectActionsIsLoading(state)).toBe(true);
  });

  it('selectActionsError should return the error', () => {
    const state = { actions: { ...initialActionsState, error: 'Something failed' } };
    expect(selectActionsError(state)).toBe('Something failed');
  });
});
