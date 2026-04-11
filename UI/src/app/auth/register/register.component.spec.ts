import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { register } from '../../store/actions/auth.actions';
import { selectAuthIsLoading, selectAuthError } from '../../store/reducers/auth.reducer';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let store: MockStore;

  const initialState = {
    auth: { user: null, token: null, isLoading: false, error: null },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render email, password, and storeName fields', () => {
    const emailInput = fixture.debugElement.query(By.css('input[type="email"]'));
    const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
    const storeNameInput = fixture.debugElement.query(By.css('input[formControlName="storeName"]'));
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(storeNameInput).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('not-valid');
    expect(emailControl?.errors?.['email']).toBeTruthy();
  });

  it('should validate password minimum length of 8', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('Ab1');
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();
  });

  it('should validate password requires uppercase letter', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('alllower1');
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();
  });

  it('should validate password requires a number', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('NoNumbers!');
    expect(passwordControl?.errors?.['pattern']).toBeTruthy();
  });

  it('should validate required storeName', () => {
    const storeNameControl = component.form.get('storeName');
    storeNameControl?.setValue('');
    expect(storeNameControl?.errors?.['required']).toBeTruthy();
  });

  it('should have valid form with correct values', () => {
    component.form.setValue({
      email: 'store@example.com',
      password: 'SecurePass1',
      storeName: 'My Store',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should dispatch register action on valid submit', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.form.setValue({
      email: 'store@example.com',
      password: 'SecurePass1',
      storeName: 'My Store',
    });
    component.onSubmit();
    expect(dispatchSpy).toHaveBeenCalledWith(
      register({
        request: {
          email: 'store@example.com',
          password: 'SecurePass1',
          storeName: 'My Store',
        },
      })
    );
  });

  it('should not dispatch if form is invalid', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should show loading state and disable button', () => {
    store.overrideSelector(selectAuthIsLoading, true);
    store.refreshState();
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  it('should display error message when error exists', () => {
    store.overrideSelector(selectAuthError, 'Email already registered');
    store.refreshState();
    fixture.detectChanges();
    const errorEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errorEl?.nativeElement.textContent).toContain('Email already registered');
  });

  it('should have link to login page', () => {
    const loginLink = fixture.debugElement.query(By.css('a[routerLink]'));
    expect(loginLink).toBeTruthy();
  });
});
