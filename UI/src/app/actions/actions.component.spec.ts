import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActionsComponent } from './actions.component';
import {
  selectAllActions,
  selectActionsIsLoading,
  selectActionsError,
  selectSelectedAction,
} from './store/reducers/actions.reducer';
import {
  loadActions,
  createNewAction,
  updateAction,
  deleteAction,
  selectAction,
} from './store/actions/actions.actions';
import { Action } from './store/models/action.model';

const MOCK_ACTIONS: Action[] = [
  {
    id: 'action-1',
    actionType: 'Query',
    responseTemplate: 'The price of {name} is {price}.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('ActionsComponent', () => {
  let component: ActionsComponent;
  let fixture: ComponentFixture<ActionsComponent>;
  let store: MockStore;

  const initialState = {
    actions: {
      actions: [],
      isLoading: false,
      error: null,
      selectedAction: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadActions on init', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(loadActions());
  });

  // =========================================================
  // List display
  // =========================================================

  it('should render action rows when actions exist', () => {
    store.overrideSelector(selectAllActions, MOCK_ACTIONS);
    store.refreshState();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.action-item'));
    expect(rows.length).toBe(1);
  });

  it('should show empty state message when no actions', () => {
    store.overrideSelector(selectAllActions, []);
    store.refreshState();
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('.actions__empty'));
    expect(emptyState).toBeTruthy();
  });

  it('should not show empty state when actions exist', () => {
    store.overrideSelector(selectAllActions, MOCK_ACTIONS);
    store.refreshState();
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('.actions__empty'));
    expect(emptyState).toBeNull();
  });

  // =========================================================
  // Create modal (US1)
  // =========================================================

  it('should set showCreateModal to true when "New Action" button is clicked', () => {
    const btn = fixture.debugElement.query(By.css('.btn--primary'));
    btn.nativeElement.click();
    expect(component.showCreateModal()).toBe(true);
  });

  it('should render create modal when showCreateModal is true', () => {
    component.showCreateModal.set(true);
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.css('app-modal'));
    expect(modal).toBeTruthy();
  });

  it('should dispatch createNewAction on ActionFormComponent saved output', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onCreateSave({ actionType: 'Query', responseTemplate: 'Template' });
    expect(dispatchSpy).toHaveBeenCalledWith(
      createNewAction({ request: { actionType: 'Query', responseTemplate: 'Template' } })
    );
  });

  it('should close create modal after dispatching createNewAction', () => {
    component.showCreateModal.set(true);
    component.onCreateSave({ actionType: 'Query', responseTemplate: 'Template' });
    expect(component.showCreateModal()).toBe(false);
  });

  it('should close create modal on cancel', () => {
    component.showCreateModal.set(true);
    component.onCreateCancel();
    expect(component.showCreateModal()).toBe(false);
  });

  // =========================================================
  // Edit modal (US3)
  // =========================================================

  it('should dispatch selectAction and set showEditModal when edit button clicked', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectAllActions, MOCK_ACTIONS);
    store.refreshState();
    fixture.detectChanges();

    component.onEditClick(MOCK_ACTIONS[0]);

    expect(dispatchSpy).toHaveBeenCalledWith(selectAction({ action: MOCK_ACTIONS[0] }));
    expect(component.showEditModal()).toBe(true);
  });

  it('should dispatch updateAction on edit saved output', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectSelectedAction, MOCK_ACTIONS[0]);
    store.refreshState();
    fixture.detectChanges();

    component.onEditSave({ responseTemplate: 'Updated' });

    expect(dispatchSpy).toHaveBeenCalledWith(
      updateAction({ id: 'action-1', request: { responseTemplate: 'Updated' } })
    );
  });

  it('should close edit modal after dispatching updateAction', () => {
    component.showEditModal.set(true);
    store.overrideSelector(selectSelectedAction, MOCK_ACTIONS[0]);
    store.refreshState();
    fixture.detectChanges();

    component.onEditSave({ responseTemplate: 'Updated' });
    expect(component.showEditModal()).toBe(false);
  });

  it('should close edit modal on cancel', () => {
    component.showEditModal.set(true);
    component.onEditCancel();
    expect(component.showEditModal()).toBe(false);
  });

  // =========================================================
  // Delete confirmation (US4)
  // =========================================================

  it('should set pendingDeleteId when delete button is clicked', () => {
    component.onDeleteClick('action-1');
    expect(component.pendingDeleteId()).toBe('action-1');
  });

  it('should dispatch deleteAction on confirmation', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onDeleteConfirmed('action-1');
    expect(dispatchSpy).toHaveBeenCalledWith(deleteAction({ id: 'action-1' }));
  });

  it('should clear pendingDeleteId after confirming delete', () => {
    component.pendingDeleteId.set('action-1');
    component.onDeleteConfirmed('action-1');
    expect(component.pendingDeleteId()).toBeNull();
  });

  it('should clear pendingDeleteId on cancel', () => {
    component.pendingDeleteId.set('action-1');
    component.onDeleteCancelled();
    expect(component.pendingDeleteId()).toBeNull();
  });

  // =========================================================
  // Error display
  // =========================================================

  it('should not dispatch updateAction when selectedAction is null', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectSelectedAction, null);
    store.refreshState();
    fixture.detectChanges();

    component.onEditSave({ responseTemplate: 'Updated' });

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateAction.type }));
    expect(component.showEditModal()).toBe(false);
  });

  it('should show error banner when error exists', () => {
    store.overrideSelector(selectActionsError, 'Something went wrong');
    store.refreshState();
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.actions__error'));
    expect(error).toBeTruthy();
  });
});
