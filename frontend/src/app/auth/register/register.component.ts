import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { register } from '../../store/actions/auth.actions';
import { selectAuthError, selectAuthIsLoading } from '../../store/reducers/auth.reducer';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).+$/;
const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;

  isLoading = toSignal(this._store.select(selectAuthIsLoading), { initialValue: false });
  error = toSignal(this._store.select(selectAuthError), { initialValue: null });

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _store: Store
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.pattern(PASSWORD_PATTERN)],
      ],
      storeName: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this._store.dispatch(register({ request: this.form.value }));
  }
}
