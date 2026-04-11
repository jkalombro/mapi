import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { login } from '../../store/actions/auth.actions';
import { selectAuthError, selectAuthIsLoading } from '../../store/reducers/auth.reducer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _store = inject(Store);

  form!: FormGroup;
  isLoading = toSignal(this._store.select(selectAuthIsLoading), { initialValue: false });
  error = toSignal(this._store.select(selectAuthError), { initialValue: null });

  ngOnInit(): void {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this._store.dispatch(login({ request: this.form.value }));
  }
}
