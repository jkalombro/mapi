import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MicIconComponent } from './mic-icon.component';

describe('MicIconComponent', () => {
  let component: MicIconComponent;
  let fixture: ComponentFixture<MicIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MicIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden when speech is not supported', () => {
    fixture.componentRef.setInput('isSupported', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeNull();
  });

  it('should be visible when speech is supported', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', false);
    fixture.componentRef.setInput('isDisabled', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
  });

  it('should have active class when isActive is true', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', true);
    fixture.componentRef.setInput('isDisabled', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('mic-icon--active');
  });

  it('should be disabled when isDisabled is true', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', false);
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should have correct aria-label when inactive', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', false);
    fixture.componentRef.setInput('isDisabled', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-label')).toBe('Start listening');
  });

  it('should have correct aria-label when active', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', true);
    fixture.componentRef.setInput('isDisabled', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-label')).toBe('Stop listening');
  });

  it('should emit clicked event on button click', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', false);
    fixture.componentRef.setInput('isDisabled', false);
    fixture.detectChanges();

    const clickedSpy = jest.fn();
    component.clicked.subscribe(clickedSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(clickedSpy).toHaveBeenCalled();
  });

  it('should not emit clicked event when disabled', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', false);
    fixture.componentRef.setInput('isDisabled', true);
    fixture.detectChanges();

    const clickedSpy = jest.fn();
    component.clicked.subscribe(clickedSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(clickedSpy).not.toHaveBeenCalled();
  });

  it('should set aria-pressed based on isActive', () => {
    fixture.componentRef.setInput('isSupported', true);
    fixture.componentRef.setInput('isActive', true);
    fixture.componentRef.setInput('isDisabled', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });
});
