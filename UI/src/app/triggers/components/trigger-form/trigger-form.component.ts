import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TriggerRequest } from '../../store/models/trigger.model';

@Component({
  selector: 'app-trigger-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trigger-form.component.html',
  styleUrl: './trigger-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerFormComponent implements OnInit {
  isLoading = input<boolean>(false);

  saved = output<TriggerRequest>();
  cancelled = output<void>();

  form!: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      phrase: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.saved.emit(this.form.value as TriggerRequest);
    this.form.reset();
  }

  onCancel(): void {
    this.form.reset();
    this.cancelled.emit();
  }
}
