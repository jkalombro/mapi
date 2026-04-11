import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionLinkFormComponent } from './action-link-form.component';
import { Action } from '../../../shared/services/actions-api.service';
import { ActionLinkRequest } from '../../store/models/trigger.model';

const mockActions: Action[] = [
  { id: '1', actionType: 'Query', responseTemplate: '{name} costs {price}', createdAt: '', updatedAt: '' },
  { id: '2', actionType: 'Add', responseTemplate: 'Added {name} at {price}', createdAt: '', updatedAt: '' },
];

describe('ActionLinkFormComponent', () => {
  let component: ActionLinkFormComponent;
  let fixture: ComponentFixture<ActionLinkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionLinkFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionLinkFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', mockActions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty actionId and sortOrder 1', () => {
    expect(component.form.get('actionId')?.value).toBe('');
    expect(component.form.get('sortOrder')?.value).toBe(1);
  });

  it('should be invalid when no action is selected', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid when action and sortOrder are set', () => {
    component.form.patchValue({ actionId: '1', sortOrder: 2 });
    expect(component.form.valid).toBe(true);
  });

  it('should be invalid when sortOrder is less than 1', () => {
    component.form.patchValue({ actionId: '1', sortOrder: 0 });
    expect(component.form.invalid).toBe(true);
  });

  it('should emit linked event with actionId and sortOrder on valid submit', () => {
    const linkedSpy = jest.fn();
    component.linked.subscribe((req: ActionLinkRequest) => linkedSpy(req));

    component.form.patchValue({ actionId: '1', sortOrder: 3 });
    component.onSubmit();

    expect(linkedSpy).toHaveBeenCalledWith({ actionId: '1', sortOrder: 3 });
  });

  it('should not emit linked event when form is invalid', () => {
    const linkedSpy = jest.fn();
    component.linked.subscribe(linkedSpy);

    component.form.patchValue({ actionId: '', sortOrder: 1 });
    component.onSubmit();

    expect(linkedSpy).not.toHaveBeenCalled();
  });

  it('should emit cancelled and reset form on cancel', () => {
    const cancelledSpy = jest.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.form.patchValue({ actionId: '2', sortOrder: 5 });
    component.onCancel();

    expect(cancelledSpy).toHaveBeenCalled();
    expect(component.form.get('sortOrder')?.value).toBe(1);
  });

  it('should reset sortOrder to 1 after successful submit', () => {
    component.form.patchValue({ actionId: '1', sortOrder: 5 });
    component.onSubmit();

    expect(component.form.get('sortOrder')?.value).toBe(1);
  });
});
