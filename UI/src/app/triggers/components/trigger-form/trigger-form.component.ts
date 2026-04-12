import { ChangeDetectionStrategy, Component, OnChanges, OnInit, SimpleChanges, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Trigger, TriggerRequest } from '../../store/models/trigger.model';

@Component({
  selector: 'app-trigger-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trigger-form.component.html',
  styleUrl: './trigger-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerFormComponent implements OnInit, OnChanges {
  editTrigger = input<Trigger | null>(null);
  isLoading = input<boolean>(false);

  saved = output<TriggerRequest>();
  cancelled = output<void>();

  form!: FormGroup;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      phrase: [this.editTrigger()?.phrase ?? '', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editTrigger'] && this.form) {
      const trigger = changes['editTrigger'].currentValue as Trigger | null;
      this.form.patchValue({ phrase: trigger?.phrase ?? '' });
    }
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
