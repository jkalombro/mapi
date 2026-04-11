import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Are you sure?');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden when isVisible is false', () => {
    fixture.componentRef.setInput('isVisible', false);
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog).toBeNull();
  });

  it('should be visible when isVisible is true', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog).toBeTruthy();
  });

  it('should display the provided message', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.componentRef.setInput('message', 'Confirm deletion?');
    fixture.detectChanges();
    const dialogEl = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialogEl.nativeElement.textContent).toContain('Confirm deletion?');
  });

  it('should emit confirmed event when confirm button is clicked', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();

    const confirmedSpy = jest.fn();
    component.confirmed.subscribe(confirmedSpy);

    const confirmBtn = fixture.debugElement.query(By.css('.dialog__btn--confirm'));
    confirmBtn.nativeElement.click();

    expect(confirmedSpy).toHaveBeenCalled();
  });

  it('should emit cancelled event when cancel button is clicked', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();

    const cancelledSpy = jest.fn();
    component.cancelled.subscribe(cancelledSpy);

    const cancelBtn = fixture.debugElement.query(By.css('.dialog__btn--cancel'));
    cancelBtn.nativeElement.click();

    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('should have an accessible dialog role', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should display custom confirm button label', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.componentRef.setInput('confirmLabel', 'Yes, delete it');
    fixture.detectChanges();
    const confirmBtn = fixture.debugElement.query(By.css('.dialog__btn--confirm'));
    expect(confirmBtn.nativeElement.textContent.trim()).toBe('Yes, delete it');
  });

  it('should display custom cancel button label', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.componentRef.setInput('cancelLabel', 'No, keep it');
    fixture.detectChanges();
    const cancelBtn = fixture.debugElement.query(By.css('.dialog__btn--cancel'));
    expect(cancelBtn.nativeElement.textContent.trim()).toBe('No, keep it');
  });
});
