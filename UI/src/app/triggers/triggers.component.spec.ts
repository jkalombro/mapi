import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TriggersComponent } from './triggers.component';
import {
  createTrigger,
  deleteTrigger,
  loadTriggers,
  selectTrigger,
  updateTrigger,
} from './store/actions/triggers.actions';
import { loadActions } from '../actions/store/actions/actions.actions';
import { initialTriggersState, selectSelectedTrigger } from './store/reducers/triggers.reducer';
import { initialActionsState } from '../actions/store/reducers/actions.reducer';
import { Trigger, TriggerRequest } from './store/models/trigger.model';

const mockTrigger: Trigger = {
  id: '1',
  phrase: "What's the price of",
  actionId: 'action-1',
  actionType: 'Query',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TriggersComponent', () => {
  let component: TriggersComponent;
  let fixture: ComponentFixture<TriggersComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggersComponent],
      providers: [
        provideMockStore({
          initialState: {
            triggers: initialTriggersState,
            actions: initialActionsState,
          },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(TriggersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadTriggers and loadActions on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadTriggers());
    expect(store.dispatch).toHaveBeenCalledWith(loadActions());
  });

  // =========================================================
  // Create modal
  // =========================================================

  it('should set showCreateModal to true when add button is clicked', () => {
    expect(component.showCreateModal()).toBe(false);
    component.onAddTriggerClick();
    expect(component.showCreateModal()).toBe(true);
  });

  it('should dispatch createTrigger and close create modal on trigger saved', () => {
    component.showCreateModal.set(true);
    const request: TriggerRequest = { phrase: 'Check price of', actionId: 'action-1' };

    component.onTriggerSaved(request);

    expect(store.dispatch).toHaveBeenCalledWith(createTrigger({ request }));
    expect(component.showCreateModal()).toBe(false);
  });

  it('should close create modal on cancel', () => {
    component.showCreateModal.set(true);
    component.onTriggerFormCancelled();
    expect(component.showCreateModal()).toBe(false);
  });

  // =========================================================
  // Edit modal
  // =========================================================

  it('should dispatch selectTrigger and set showEditModal on edit click', () => {
    component.onEditTriggerClick(mockTrigger);

    expect(store.dispatch).toHaveBeenCalledWith(selectTrigger({ trigger: mockTrigger }));
    expect(component.showEditModal()).toBe(true);
  });

  it('should dispatch updateTrigger and close edit modal on edit saved', () => {
    store.overrideSelector(selectSelectedTrigger, mockTrigger);
    store.refreshState();
    fixture.detectChanges();

    component.showEditModal.set(true);
    component.onTriggerEditSaved({ phrase: 'Updated phrase', actionId: 'action-2' });

    expect(store.dispatch).toHaveBeenCalledWith(
      updateTrigger({ id: '1', request: { phrase: 'Updated phrase', actionId: 'action-2' } })
    );
    expect(component.showEditModal()).toBe(false);
  });

  it('should close edit modal on edit cancel', () => {
    component.showEditModal.set(true);
    component.onTriggerEditCancelled();
    expect(component.showEditModal()).toBe(false);
  });

  it('should not dispatch updateTrigger when selectedTrigger is null', () => {
    store.overrideSelector(selectSelectedTrigger, null);
    store.refreshState();
    fixture.detectChanges();

    component.showEditModal.set(true);
    component.onTriggerEditSaved({ phrase: 'Updated phrase', actionId: 'action-1' });

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: updateTrigger.type }));
    expect(component.showEditModal()).toBe(false);
  });

  // =========================================================
  // Delete
  // =========================================================

  it('should set pendingDeleteId when delete is requested', () => {
    component.onDeleteTrigger('1');
    expect(component.pendingDeleteId()).toBe('1');
  });

  it('should dispatch deleteTrigger and clear pendingDeleteId on confirm', () => {
    component.pendingDeleteId.set('1');
    component.onDeleteConfirmed('1');

    expect(store.dispatch).toHaveBeenCalledWith(deleteTrigger({ id: '1' }));
    expect(component.pendingDeleteId()).toBeNull();
  });

  it('should clear pendingDeleteId on cancel', () => {
    component.pendingDeleteId.set('1');
    component.onDeleteCancelled();
    expect(component.pendingDeleteId()).toBeNull();
  });

  // =========================================================
  // Misc
  // =========================================================

  it('trackById should return the trigger id', () => {
    expect(component.trackById(0, mockTrigger)).toBe('1');
  });
});
