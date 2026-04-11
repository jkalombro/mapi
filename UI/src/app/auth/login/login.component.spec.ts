import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { render, screen, fireEvent } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import { login } from '../../store/actions/auth.actions';
import { selectAuthIsLoading, selectAuthError } from '../../store/reducers/auth.reducer';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;

  const initialState = {
    auth: { user: null, token: null, isLoading: false, error: null },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render email and password fields', () => {
    const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
    const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBe(true);
    expect(emailControl?.errors?.['email']).toBeTruthy();
  });

  it('should validate required fields', () => {
    const emailControl = component.form.get('email');
    const passwordControl = component.form.get('password');
    emailControl?.setValue('');
    passwordControl?.setValue('');
    expect(emailControl?.errors?.['required']).toBeTruthy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();
  });

  it('should have valid form with correct values', () => {
    component.form.setValue({ email: 'test@example.com', password: 'Password1' });
    expect(component.form.valid).toBe(true);
  });

  it('should dispatch login action on valid submit', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.form.setValue({ email: 'test@example.com', password: 'Password1' });
    component.onSubmit();
    expect(dispatchSpy).toHaveBeenCalledWith(
      login({ request: { email: 'test@example.com', password: 'Password1' } })
    );
  });

  it('should not dispatch if form is invalid', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    store.overrideSelector(selectAuthIsLoading, true);
    store.refreshState();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should display error message when error exists', () => {
    store.overrideSelector(selectAuthError, 'Invalid credentials');
    store.refreshState();
    fixture.detectChanges();
    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl?.nativeElement.textContent).toContain('Invalid credentials');
  });

  it('should have link to register page', () => {
    const registerLink = fixture.debugElement.query(By.css('a[routerLink]'));
    expect(registerLink).toBeTruthy();
  });

  it('should disable submit button when loading', () => {
    store.overrideSelector(selectAuthIsLoading, true);
    store.refreshState();
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(submitButton.nativeElement.disabled).toBe(true);
  });
});
