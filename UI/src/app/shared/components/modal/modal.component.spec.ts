import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Modal');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render overlay when isVisible is false', () => {
    fixture.componentRef.setInput('isVisible', false);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeNull();
  });

  it('should render overlay when isVisible is true', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeTruthy();
  });

  it('should render title in the modal header', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.componentRef.setInput('title', 'My Modal Title');
    fixture.detectChanges();
    const header = fixture.debugElement.query(By.css('.modal__title'));
    expect(header.nativeElement.textContent.trim()).toBe('My Modal Title');
  });

  it('should emit closed when × button is clicked', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const closeBtn = fixture.debugElement.query(By.css('.modal__close'));
    closeBtn.nativeElement.click();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit closed when backdrop is clicked', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    overlay.nativeElement.click();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not emit closed when dialog itself is clicked (stop propagation)', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const dialog = fixture.debugElement.query(By.css('.modal'));
    dialog.nativeElement.click();

    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should emit closed when Escape key is pressed', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not emit closed on Escape when not visible', () => {
    fixture.componentRef.setInput('isVisible', false);
    fixture.detectChanges();

    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should have role="dialog" and aria-modal="true" on the dialog element', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog).toBeTruthy();
    expect(dialog.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should have aria-labelledby pointing to the title element', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    const labelledById = dialog.nativeElement.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const titleEl = fixture.debugElement.query(By.css(`#${labelledById}`));
    expect(titleEl).toBeTruthy();
  });

  it('should project content inside the modal body', () => {
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const body = fixture.debugElement.query(By.css('.modal__body'));
    expect(body).toBeTruthy();
  });
});
