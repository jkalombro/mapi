import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActionFormComponent } from './action-form.component';
import { Action, CreateActionRequest, UpdateActionRequest } from '../../store/models/action.model';

const mockAction: Action = {
  id: 'action-1',
  actionType: 'Query',
  responseTemplate: 'The price of {name} is {price}.',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ActionFormComponent — Create Mode', () => {
  let component: ActionFormComponent;
  let fixture: ComponentFixture<ActionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render ActionType selector when editAction is null', () => {
    const select = fixture.debugElement.query(By.css('[formControlName="actionType"]'));
    expect(select).toBeTruthy();
  });

  it('should have ActionType selector enabled in create mode', () => {
    const select: HTMLSelectElement = fixture.debugElement.query(By.css('[formControlName="actionType"]')).nativeElement;
    expect(select.disabled).toBe(false);
  });

  it('should render ResponseTemplate textarea', () => {
    const textarea = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]'));
    expect(textarea).toBeTruthy();
  });

  it('should emit CreateActionRequest from saved output on valid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    const select: HTMLSelectElement = fixture.debugElement.query(By.css('[formControlName="actionType"]')).nativeElement;
    select.value = 'Query';
    select.dispatchEvent(new Event('change'));

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]')).nativeElement;
    textarea.value = 'Valid response template';
    textarea.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
    submitBtn.nativeElement.click();
    fixture.detectChanges();

    expect(savedSpy).toHaveBeenCalledWith<[CreateActionRequest]>({
      actionType: 'Query',
      responseTemplate: 'Valid response template',
    });
  });

  it('should emit cancelled on cancel click', () => {
    const cancelledSpy = jest.fn();
    component.cancelled.subscribe(cancelledSpy);

    const cancelBtn = fixture.debugElement.query(By.css('[type="button"]'));
    cancelBtn.nativeElement.click();

    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('should not emit saved when ResponseTemplate is empty', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]')).nativeElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
    submitBtn.nativeElement.click();

    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('should show validation error when ResponseTemplate is touched and empty', () => {
    const textarea = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]'));
    textarea.nativeElement.dispatchEvent(new Event('focus'));
    textarea.nativeElement.value = '';
    textarea.nativeElement.dispatchEvent(new Event('input'));
    textarea.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.form-field__error'));
    expect(error).toBeTruthy();
  });

  it('should not emit saved when ResponseTemplate exceeds 500 characters', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]')).nativeElement;
    textarea.value = 'a'.repeat(501);
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
    submitBtn.nativeElement.click();

    expect(savedSpy).not.toHaveBeenCalled();
  });
});

describe('ActionFormComponent — Edit Mode', () => {
  let component: ActionFormComponent;
  let fixture: ComponentFixture<ActionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('editAction', mockAction);
    fixture.detectChanges();
  });

  it('should disable ActionType selector in edit mode', () => {
    const select: HTMLSelectElement = fixture.debugElement.query(By.css('[formControlName="actionType"]')).nativeElement;
    expect(select.disabled).toBe(true);
  });

  it('should pre-fill ResponseTemplate from editAction', () => {
    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]')).nativeElement;
    expect(textarea.value).toBe('The price of {name} is {price}.');
  });

  it('should emit UpdateActionRequest (no actionType) from saved on valid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]')).nativeElement;
    textarea.value = 'Updated response template';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
    submitBtn.nativeElement.click();
    fixture.detectChanges();

    expect(savedSpy).toHaveBeenCalledWith<[UpdateActionRequest]>({
      responseTemplate: 'Updated response template',
    });
  });

  it('should still validate ResponseTemplate in edit mode', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css('[formControlName="responseTemplate"]')).nativeElement;
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('[type="submit"]'));
    submitBtn.nativeElement.click();

    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('should re-enable ActionType selector when editAction changes to null', () => {
    component.ngOnChanges({
      editAction: {
        currentValue: null,
        previousValue: mockAction,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(component.form.get('actionType')?.disabled).toBe(false);
  });
});
