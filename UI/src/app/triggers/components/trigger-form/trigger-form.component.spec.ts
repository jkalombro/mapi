import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TriggerFormComponent } from './trigger-form.component';
import { Action } from '../../../actions/store/models/action.model';
import { Trigger, TriggerRequest } from '../../store/models/trigger.model';

const mockAction: Action = {
  id: 'action-1',
  actionType: 'Query',
  responseTemplate: 'The {item} is {value}',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockActions: Action[] = [
  mockAction,
  { id: 'action-2', actionType: 'Add', responseTemplate: "I've added {item}.", createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

const mockTrigger: Trigger = {
  id: '1',
  phrase: "What's the price of",
  actionId: 'action-1',
  actionType: 'Query',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TriggerFormComponent — Create Mode (editTrigger = null)', () => {
  let component: TriggerFormComponent;
  let fixture: ComponentFixture<TriggerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TriggerFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', mockActions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty phrase and actionId', () => {
    expect(component.form.get('phrase')?.value).toBe('');
    expect(component.form.get('actionId')?.value).toBe('');
  });

  it('should be invalid when phrase is empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should be invalid when phrase has less than 2 characters', () => {
    component.form.patchValue({ phrase: 'a', actionId: 'action-1' });
    expect(component.form.invalid).toBe(true);
  });

  it('should be invalid when actionId is not selected', () => {
    component.form.patchValue({ phrase: 'Valid phrase', actionId: '' });
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid when phrase has 2+ characters and actionId is set', () => {
    component.form.patchValue({ phrase: 'What is the price', actionId: 'action-1' });
    expect(component.form.valid).toBe(true);
  });

  it('should emit saved event with phrase and actionId on valid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe((req: TriggerRequest) => savedSpy(req));

    component.form.patchValue({ phrase: "What's the price of", actionId: 'action-1' });
    component.onSubmit();

    expect(savedSpy).toHaveBeenCalledWith({ phrase: "What's the price of", actionId: 'action-1' });
  });

  it('should not emit saved event on invalid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    component.form.patchValue({ phrase: '', actionId: '' });
    component.onSubmit();

    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('should emit cancelled event and reset form on cancel', () => {
    const cancelledSpy = jest.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.form.patchValue({ phrase: 'Some phrase', actionId: 'action-1' });
    component.onCancel();

    expect(cancelledSpy).toHaveBeenCalled();
    expect(component.form.get('phrase')?.value).toBeNull();
    expect(component.form.get('actionId')?.value).toBeNull();
  });

  it('should reset form after successful submit', () => {
    component.form.patchValue({ phrase: 'Test phrase', actionId: 'action-1' });
    component.onSubmit();

    expect(component.form.get('phrase')?.value).toBeNull();
    expect(component.form.get('actionId')?.value).toBeNull();
  });

  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitBtn.nativeElement.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.form.patchValue({ phrase: 'Valid phrase', actionId: 'action-1' });
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitBtn.nativeElement.disabled).toBe(false);
  });

  it('should render action options in the dropdown', () => {
    fixture.detectChanges();
    const options = fixture.debugElement.queryAll(By.css('select#actionId option:not([disabled])'));
    expect(options).toHaveLength(2);
    expect(options[0].nativeElement.textContent.trim()).toBe('Query');
    expect(options[1].nativeElement.textContent.trim()).toBe('Add');
  });
});

describe('TriggerFormComponent — Edit Mode (editTrigger is non-null)', () => {
  let component: TriggerFormComponent;
  let fixture: ComponentFixture<TriggerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TriggerFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('editTrigger', mockTrigger);
    fixture.componentRef.setInput('actions', mockActions);
    fixture.detectChanges();
  });

  it('should pre-fill phrase and actionId from editTrigger', () => {
    expect(component.form.get('phrase')?.value).toBe("What's the price of");
    expect(component.form.get('actionId')?.value).toBe('action-1');
  });

  it('should be valid when editTrigger values are pre-filled', () => {
    expect(component.form.valid).toBe(true);
  });

  it('should emit saved with the updated phrase and actionId on submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    component.form.patchValue({ phrase: 'Updated phrase', actionId: 'action-2' });
    component.onSubmit();

    expect(savedSpy).toHaveBeenCalledWith({ phrase: 'Updated phrase', actionId: 'action-2' });
  });

  it('should clear phrase and actionId when editTrigger changes to null via ngOnChanges', () => {
    component.ngOnChanges({
      editTrigger: {
        currentValue: null,
        previousValue: mockTrigger,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(component.form.get('phrase')?.value).toBe('');
    expect(component.form.get('actionId')?.value).toBe('');
  });
});
