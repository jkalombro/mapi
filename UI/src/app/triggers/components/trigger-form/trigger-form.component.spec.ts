import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TriggerFormComponent } from './trigger-form.component';
import { TriggerRequest } from '../../store/models/trigger.model';

describe('TriggerFormComponent', () => {
  let component: TriggerFormComponent;
  let fixture: ComponentFixture<TriggerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriggerFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TriggerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an empty phrase field', () => {
    expect(component.form.get('phrase')?.value).toBe('');
  });

  it('should be invalid when phrase is empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should be invalid when phrase has less than 2 characters', () => {
    component.form.patchValue({ phrase: 'a' });
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid when phrase has 2 or more characters', () => {
    component.form.patchValue({ phrase: 'What is the price' });
    expect(component.form.valid).toBe(true);
  });

  it('should emit saved event with phrase on valid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe((req: TriggerRequest) => savedSpy(req));

    component.form.patchValue({ phrase: "What's the price of" });
    component.onSubmit();

    expect(savedSpy).toHaveBeenCalledWith({ phrase: "What's the price of" });
  });

  it('should not emit saved event on invalid submit', () => {
    const savedSpy = jest.fn();
    component.saved.subscribe(savedSpy);

    component.form.patchValue({ phrase: '' });
    component.onSubmit();

    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('should emit cancelled event and reset form on cancel', () => {
    const cancelledSpy = jest.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.form.patchValue({ phrase: 'Some phrase' });
    component.onCancel();

    expect(cancelledSpy).toHaveBeenCalled();
    expect(component.form.get('phrase')?.value).toBeNull();
  });

  it('should reset form after successful submit', () => {
    component.form.patchValue({ phrase: 'Test phrase' });
    component.onSubmit();

    expect(component.form.get('phrase')?.value).toBeNull();
  });

  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitBtn.nativeElement.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.form.patchValue({ phrase: 'Valid phrase' });
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitBtn.nativeElement.disabled).toBe(false);
  });
});
