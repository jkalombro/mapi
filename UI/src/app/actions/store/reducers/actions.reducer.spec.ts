import { Action as NgRxAction } from '@ngrx/store';
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
  selectAction,
  updateAction,
  updateActionFailure,
  updateActionSuccess,
} from '../actions/actions.actions';
import { Action, ActionsState } from '../models/action.model';
import { actionsReducer, initialActionsState } from './actions.reducer';

const mockAction: Action = {
  id: 'action-1',
  actionType: 'Query',
  responseTemplate: 'The price of {name} is {price}.',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockAction2: Action = {
  id: 'action-2',
  actionType: 'Statement',
  responseTemplate: '{name} is available.',
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

  // =========================================================
  // loadActions
  // =========================================================

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

  // =========================================================
  // createNewAction / createActionSuccess / createActionFailure
  // =========================================================

  it('createNewAction: should set isLoading to true', () => {
    const state = reduce(
      initialActionsState,
      createNewAction({ request: { actionType: 'Query', responseTemplate: 'Template' } })
    );
    expect(state.isLoading).toBe(true);
  });

  it('createActionSuccess: should append action to list and clear isLoading', () => {
    const state = reduce(
      { ...initialActionsState, actions: [mockAction], isLoading: true },
      createActionSuccess({ action: mockAction2 })
    );
    expect(state.isLoading).toBe(false);
    expect(state.actions).toHaveLength(2);
    expect(state.actions[1].id).toBe('action-2');
  });

  it('createActionFailure: should set error and clear isLoading', () => {
    const state = reduce(
      { ...initialActionsState, isLoading: true },
      createActionFailure({ error: 'Validation failed' })
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Validation failed');
  });

  // =========================================================
  // updateAction / updateActionSuccess / updateActionFailure
  // =========================================================

  it('updateAction: should set isLoading to true', () => {
    const state = reduce(
      initialActionsState,
      updateAction({ id: 'action-1', request: { responseTemplate: 'New template' } })
    );
    expect(state.isLoading).toBe(true);
  });

  it('updateActionSuccess: should replace matching action in list and clear isLoading', () => {
    const updatedAction: Action = { ...mockAction, responseTemplate: 'Updated template' };
    const state = reduce(
      { ...initialActionsState, actions: [mockAction, mockAction2], isLoading: true },
      updateActionSuccess({ action: updatedAction })
    );
    expect(state.isLoading).toBe(false);
    expect(state.actions).toHaveLength(2);
    const found = state.actions.find((a) => a.id === 'action-1');
    expect(found?.responseTemplate).toBe('Updated template');
  });

  it('updateActionSuccess: should clear selectedAction', () => {
    const state = reduce(
      { ...initialActionsState, actions: [mockAction], selectedAction: mockAction, isLoading: true },
      updateActionSuccess({ action: mockAction })
    );
    expect(state.selectedAction).toBeNull();
  });

  it('updateActionFailure: should set error and clear isLoading', () => {
    const state = reduce(
      { ...initialActionsState, isLoading: true },
      updateActionFailure({ error: 'Update failed' })
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Update failed');
  });

  // =========================================================
  // deleteAction / deleteActionSuccess / deleteActionFailure
  // =========================================================

  it('deleteAction: should set isLoading to true', () => {
    const state = reduce(
      initialActionsState,
      deleteAction({ id: 'action-1' })
    );
    expect(state.isLoading).toBe(true);
  });

  it('deleteActionSuccess: should remove action from list by id', () => {
    const state = reduce(
      { ...initialActionsState, actions: [mockAction, mockAction2], isLoading: true },
      deleteActionSuccess({ id: 'action-1' })
    );
    expect(state.isLoading).toBe(false);
    expect(state.actions).toHaveLength(1);
    expect(state.actions[0].id).toBe('action-2');
  });

  it('deleteActionFailure: should set error and preserve list', () => {
    const state = reduce(
      { ...initialActionsState, actions: [mockAction], isLoading: true },
      deleteActionFailure({ error: 'Conflict' })
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Conflict');
    expect(state.actions).toHaveLength(1);
  });

  // =========================================================
  // selectAction
  // =========================================================

  it('selectAction: should set selectedAction', () => {
    const state = reduce(initialActionsState, selectAction({ action: mockAction }));
    expect(state.selectedAction).toEqual(mockAction);
  });

  it('selectAction with null: should clear selectedAction', () => {
    const state = reduce(
      { ...initialActionsState, selectedAction: mockAction },
      selectAction({ action: null })
    );
    expect(state.selectedAction).toBeNull();
  });
});
