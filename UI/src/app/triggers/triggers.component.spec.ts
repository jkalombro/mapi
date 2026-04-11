import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { TriggersComponent } from './triggers.component';
import { ActionsApiService } from '../shared/services/actions-api.service';
import { createTrigger, deleteTrigger, linkAction, loadTriggers, unlinkAction } from './store/actions/triggers.actions';
import { initialTriggersState } from './store/reducers/triggers.reducer';
import { Trigger, TriggerRequest } from './store/models/trigger.model';

const mockTrigger: Trigger = {
  id: '1',
  phrase: "What's the price of",
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  actions: [],
};

describe('TriggersComponent', () => {
  let component: TriggersComponent;
  let fixture: ComponentFixture<TriggersComponent>;
  let store: MockStore;
  let actionsServiceMock: { getAll: jest.Mock };

  beforeEach(async () => {
    actionsServiceMock = { getAll: jest.fn().mockReturnValue(of([])) };

    await TestBed.configureTestingModule({
      imports: [TriggersComponent],
      providers: [
        provideMockStore({ initialState: { triggers: initialTriggersState } }),
        { provide: ActionsApiService, useValue: actionsServiceMock },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(TriggersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadTriggers on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadTriggers());
  });

  it('should show the trigger form when add button is clicked', () => {
    expect(component.showTriggerForm()).toBe(false);
    component.onAddTriggerClick();
    expect(component.showTriggerForm()).toBe(true);
  });

  it('should dispatch createTrigger and hide form on trigger saved', () => {
    component.showTriggerForm.set(true);
    const request: TriggerRequest = { phrase: 'Check price of' };

    component.onTriggerSaved(request);

    expect(store.dispatch).toHaveBeenCalledWith(createTrigger({ request }));
    expect(component.showTriggerForm()).toBe(false);
  });

  it('should hide form on cancel', () => {
    component.showTriggerForm.set(true);
    component.onTriggerFormCancelled();
    expect(component.showTriggerForm()).toBe(false);
  });

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

  it('should set linkingTriggerId when link action is clicked', () => {
    component.onLinkActionClick('1');
    expect(component.linkingTriggerId()).toBe('1');
  });

  it('should dispatch linkAction and dispatch loadTriggers on action linked', () => {
    component.linkingTriggerId.set('1');
    component.onActionLinked({ actionId: '2', sortOrder: 1 });

    expect(store.dispatch).toHaveBeenCalledWith(linkAction({ triggerId: '1', request: { actionId: '2', sortOrder: 1 } }));
    expect(component.linkingTriggerId()).toBeNull();
  });

  it('should clear linkingTriggerId on action link cancelled', () => {
    component.linkingTriggerId.set('1');
    component.onActionLinkCancelled();
    expect(component.linkingTriggerId()).toBeNull();
  });

  it('should dispatch unlinkAction when unlink is called', () => {
    component.onUnlinkAction('1', '2');
    expect(store.dispatch).toHaveBeenCalledWith(unlinkAction({ triggerId: '1', actionId: '2' }));
  });

  it('isLinkingFor should return true for matching triggerId', () => {
    component.linkingTriggerId.set('1');
    expect(component.isLinkingFor('1')).toBe(true);
    expect(component.isLinkingFor('2')).toBe(false);
  });
});
